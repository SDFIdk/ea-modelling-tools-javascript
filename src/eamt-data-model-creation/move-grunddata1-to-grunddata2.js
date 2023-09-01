!INC eamt-utilities._logging-utils
!INC eamt-utilities._command-line-utils
!INC eamt-utilities._messages
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._constants
!INC eamt-utilities._tagged-values-utils
!INC eamt-utilities._model-utils

const connectorSet = new Set();
var elementNumber = 0;
var attributeNumber = 0;
var enumNumber = 0;
var roleNumber = 0;
var diagramNumber = 0;
var promptResult;

/**
 * Update a model to use the UML profile for basic data (grunddata) version 2 
 * instead of the UML profile for basic data version 1. This includes:
 *
 * - updating the stereotypes;
 * - copying the values of the tagged values, when possible;
 * - updating the definitions to start with a lower case character and to end without a full stop;
 * - creating classification models from enumeration, if wanted;
 * - updating the diagram types.
 *
 * Prerequisite: The following MDGs must be installed and enabled:
 * - MDG with id GD2MDG (for Basic Data v2) in file Grunddata2MDG.xml;
 * - MDG with id Grunddata (for Basic Data v1) in file GrunddataMDG.xml;
 * - MDG with id Geodata (for Basic Data v1) in file Geodata MDG.xml.
 *
 * MDG's are located in %APPDATA%\Sparx Systems\EA\MDGTechnologies;
 * the id of an MDG is found in attribute id in element /MDG.Technology/Documentation/.
 *
 * Note: it can be neccesary to use script fix-grunddata-dkdomaenemodel-stereotype first.
 *
 * Note: not all mandatory version 2 tags can be filled out from the version 1 tags, 
 * so for a model to be version 2 compliant, more tags must be filled out.
 *
 * @summary Upgrade a model from the UML profile of "Modelregler for Grunddata version 1" to the UML profile of "Modelregler for Grunddata version 2".
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	if (!Repository.IsTechnologyEnabled("GD2MDG")) {
		throw new Error("The MDG with id GD2MDG, containing UML profile Grunddata2, is not enabled.");
	}
	if (!Repository.IsTechnologyEnabled("Geodata")) {
		throw new Error("The MDG with id Geodata, containing UML profile Geodata, is not enabled.");
	}
	if (!Repository.IsTechnologyEnabled("Grunddata")) {
		throw new Error("The MDG with id Geodata, containing UML profile Grunddata, is not enabled.");
	}
	LOGInfo("=======================================");
	// Get the currently selected package in the tree to work on
	var packageMain as EA.Package;
	packageMain = Repository.GetTreeSelectedPackage();
	if (packageMain != null && packageMain.ParentID != 0) {
		if (packageMain.Element.FQStereotype == "Grunddata::DKDomænemodel") {
			promptResult = Session.Prompt("Yes: Create classification models from enumerations\r\nNo: Keep enumerations i current model", promptYESNO);

			LOGInfo("Upgrade model " + packageMain.Name + " from the Grunddata UML profile to the Grunddata2 UML profile");
			
			/*
			 * The following has to be done for changing the stereotype of a model element:
			 * 1. Save the tagged values in a temporary map.
			 * 2. Assign the fully-qualified stereotype name to property StereotypeEx;
			 * 3. Save the new stereotype in the database by calling Update() on the model element;
			 *    This will also result the deletion of the tagged values associated with the old stereotype
			 *    and the addition of the tagged values associated with the new stereotype;
			 *    Note that Repository.SynchProfile does not have to be called, this is only relevant when the tags of a stereotype have changed.
			 * 4. Refresh the tagged values of the model element, as they have changed, see step 3;
			 * 5. Set the tagged values using the temporary map created in step 1.
			 */

			changePackageElementStereotypeAndTags(packageMain.Element);
			
			upgradeDiagrams(packageMain /* EA.Package */ );

			changeElementStereotypes(packageMain, packageMain);

			var packages = getSubpackagesOfPackage(packageMain);
			var subpackage as EA.Package;
			for (var i = 0; i < packages.length; i++) {
				subpackage = packages[i];
				changeElementStereotypes(subpackage, packageMain);
			}

			LOGInfo("\nSummary");
			LOGInfo("Changed diagram type for " + diagramNumber + " diagrams");
			LOGInfo("Changed stereotype on " + elementNumber + " elements");
			LOGInfo("Changed stereotype on " + attributeNumber + " attributes");
			LOGInfo("Changed stereotype on " + enumNumber + " enums");
			LOGInfo("Changed stereotype on " + roleNumber + " roles");
			LOGInfo("Done!");
			
			Repository.RefreshModelView(packageMain.PackageID);
		} else {
			throw new Error("A package with stereotype Grunddata::DKDomænemodel, not " + packageMain.Element.FQStereotype + ", has to be selected.");
		}
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

function changePackageElementStereotypeAndTags(packageElement) {
	var tagsPackageElement = new Map();
	tagsPackageElement.set("responsibleEntity", getTaggedValueElement(packageElement, "registermyndighed", ""));
	tagsPackageElement.set("versionInfo", getTaggedValueElement(packageElement, "version", ""));
	packageElement.StereotypeEx = "Grunddata2::DKDomænemodel";
	packageElement.Update();
	packageElement.TaggedValues.Refresh();
	setTaggedValueElement(packageElement, "responsibleEntity", tagsPackageElement.get("responsibleEntity"));
	setTaggedValueElement(packageElement, "versionInfo", tagsPackageElement.get("versionInfo"));
	LOGInfo("Changed stereotype of package " + packageElement.Name);
}


/**	
 * Copies grunddata element tags to a temporary copy
 *
 */
function changeElementStereotypes(currentPackage, packageMain) {
	var elements = currentPackage.Elements;

	for (var i = 0; i < elements.Count; i++) {
		currentElement = elements.GetAt(i);
		var tagsElement;

		LOGDebug("Current element: " + currentElement.Name + " (type=" + currentElement.Type + ";stereotype=" + currentElement.FQStereotype + ")");
		if (currentElement.FQStereotype == "Grunddata::DKObjekttype" || currentElement.FQStereotype == "Geodata::DKFeaturetype" || currentElement.FQStereotype == "Geodata::DKObjekttype") {
			changeStereotypeAndTagsElement(currentElement, "Grunddata2::DKObjekttype");
			changeStereotypeAndTagsAttribute(currentElement, "Grunddata2::DKEgenskab");
			changeConnectorEndStereotype(currentElement);
		} else if (currentElement.FQStereotype == "Grunddata::DKKodeliste") {
			changeStereotypeAndTagsElement(currentElement, "Grunddata2::DKKodeliste");
		} else if (currentElement.FQStereotype == "Grunddata::DKDatatype") {
			changeStereotypeAndTagsElement(currentElement, "Grunddata2::DKDatatype");
			changeStereotypeAndTagsAttribute(currentElement, "Grunddata2::DKEgenskab");
		} else if (currentElement.FQStereotype == "Grunddata::DKEnumeration") {
			switch (promptResult) {
				case resultYes:
					var newPackage as EA.Package;
					newPackage = packageMain.Packages.AddNew(currentElement.Name, null);
					newPackage.Update();
					newPackage.Element.StereotypeEx = "Grunddata2::DKKlassifikationsmodel";
					newPackage.Element.Update();
					newPackage.Element.TaggedValues.Refresh();

					LOGInfo("Created new package DKKlassifikationsmodel: " + currentElement.Name);

					var pi = newPackage.PackageID;
					currentElement.PackageID = pi;
					break;
				case resultNo:
					// do nothing
					break;
			}
			changeStereotypeAndTagsElement(currentElement, "Grunddata2::DKEnumeration");
			changeStereotypeAndTagsAttribute(currentElement, "Grunddata2::DKEnumværdi");
		}
	}
}

function changeStereotypeAndTagsElement(element, stereotypeEx) {
	LOGDebug("Change stereotype and tags on " + element.Name);
	tagsElement = getGrunddataTagsElement(currentElement);
	currentElement.StereotypeEx = stereotypeEx;
	currentElement.Update();
	currentElement.TaggedValues.Refresh();
	setGrunddataTagsElement(currentElement, tagsElement);
	elementNumber++;
	LOGInfo("Changed stereotype on: " + currentElement.Name);
}

/**	
 * Copies grunddata element tags to a temporary Map.
 */
function getGrunddataTagsElement(element) {
	var tagsElement = new Map();
	tagsElement.set("definition (da)", upgradeStrings(getTaggedValueElement(element, "definition", "")));
	tagsElement.set("comment (da)", getTaggedValueElement(element, "note", ""));
	tagsElement.set("legalSource", getTaggedValueElement(element, "lovgrundlag", ""));
	tagsElement.set("example (da)", getTaggedValueElement(element, "eksempel", ""));
	tagsElement.set("altLabel (da)", getTaggedValueElement(element, "alternativtNavn", ""));
	return tagsElement;
}

function setGrunddataTagsElement(element, tagsElement) {
	setTaggedValueElement(element, "definition (da)", tagsElement.get("definition (da)"));
	setTaggedValueElement(element, "comment (da)", tagsElement.get("comment (da)"));
	setTaggedValueElement(element, "legalSource", tagsElement.get("legalSource"));
	setTaggedValueElement(element, "example (da)", tagsElement.get("example (da)"));
	setTaggedValueElement(element, "altLabel (da)", tagsElement.get("altLabel (da)"));
}

/**	
 * Change stereotype on attributes from Grunddata::DKEgenskab to either Grunddata2::DKEgenskab or Grunddata2::DKEnumværdi.
 */
function changeStereotypeAndTagsAttribute(currentElement, newStereotype) {
	var attributes as EA.Collection;
	attributes = currentElement.Attributes;
	for (var i = 0; i < attributes.Count; i++) {
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt(i);
		LOGDebug("Current attribute: " + currentAttribute.Name);

		var tagsAttribute = new Map();
		tagsAttribute = getGrunddataTagsAttribute(currentAttribute);
		currentAttribute.StereotypeEx = newStereotype;
		currentAttribute.Update();
		currentAttribute.TaggedValues.Refresh();
		setGrunddataTagsAttribute(currentAttribute, tagsAttribute);
		LOGInfo("  Changed stereotype on: " + currentAttribute.Name);
		
		switch (newStereotype) {
			case "Grunddata2::DKEgenskab":
				attributeNumber++;
				break;
			case "Grunddata2::DKEnumværdi":
				enumNumber++;
				break;
			default:
				throw new Error("Error in script: unknown stereotype " + newStereotype);
		}
		
	}
}

/**	
 * Copies grunddata attribute tags to a temporary Map.
 */
function getGrunddataTagsAttribute(attribute) {
	var tagsAttribute = new Map();
	tagsAttribute.set("definition (da)", upgradeStrings(getTaggedValueAttribute(attribute, "definition", "")));
	tagsAttribute.set("comment (da)", getTaggedValueAttribute(attribute, "note", ""));
	tagsAttribute.set("legalSource", getTaggedValueAttribute(attribute, "lovgrundlag", ""));
	tagsAttribute.set("example (da)", getTaggedValueAttribute(attribute, "eksempel", ""));
	tagsAttribute.set("altLabel (da)", getTaggedValueAttribute(attribute, "alternativtNavn", ""));
	return tagsAttribute;
}

function setGrunddataTagsAttribute(attribute, tagsAttribute) {
	setTaggedValueAttribute(attribute, "definition (da)", tagsAttribute.get("definition (da)"));
	setTaggedValueAttribute(attribute, "comment (da)", tagsAttribute.get("comment (da)"));
	setTaggedValueAttribute(attribute, "legalSource", tagsAttribute.get("legalSource"));
	setTaggedValueAttribute(attribute, "example (da)", tagsAttribute.get("example (da)"));
	setTaggedValueAttribute(attribute, "altLabel (da)", tagsAttribute.get("altLabel (da)"));
}

/**	
 * Change stereotype on roles on association connectors from Grunddata::DKEgenskab to Grunddata2::DKEgenskab
 *
 */
function changeConnectorEndStereotype(currentElement) {
	var currentConnector as EA.Connector;
	var clientEnd as EA.ConnectorEnd;
	var supplierEnd as EA.ConnectorEnd;

	connectors = currentElement.Connectors;
	for (var i = 0; i < connectors.Count; i++) {
		currentConnector = connectors.GetAt(i);
		if (currentConnector.Type == "Association") {
			LOGDebug("  Current association: " + currentConnector.Name);

			if (connectorSet.has(currentConnector.ConnectorID) == false) {
				connectorSet.add(currentConnector.ConnectorID);

				clientEnd = currentConnector.ClientEnd;
				LOGDebug("Current association end: " + clientEnd.Role);
				// No property ConnectorEnd.FQStereotype exists, so just checking the Stereotype property
				if (clientEnd.Role.length > 0 || clientEnd.Stereotype == "DKEgenskab") {
					var tagsClientEnd = getGrunddataTagsConnectorEnd(currentConnector, true);
					clientEnd.StereotypeEx = "Grunddata2::DKEgenskab";
					clientEnd.Update();
					clientEnd.TaggedValues.Refresh();
					setGrunddataTagsConnectorEnd(currentConnector, true, tagsClientEnd);
					LOGInfo("  Changed stereotype on role: " + clientEnd.Role);
					roleNumber++;
				}

				supplierEnd = currentConnector.SupplierEnd;
				LOGDebug("Current association end: " + supplierEnd.Role);
				// No property ConnectorEnd.FQStereotype exists, so just checking the Stereotype property
				if (supplierEnd.Role.length > 0 || supplierEnd.Stereotype == "DKEgenskab") {
					var tagsSupplierEnd = getGrunddataTagsConnectorEnd(currentConnector, false);
					supplierEnd.StereotypeEx = "Grunddata2::DKEgenskab";
					supplierEnd.Update();
					supplierEnd.TaggedValues.Refresh();
					setGrunddataTagsConnectorEnd(currentConnector, false, tagsSupplierEnd);
					LOGInfo("  Changed stereotype on role: " + supplierEnd.Role);
					roleNumber++;
				}
				currentConnector.Update();
			}
		}
	}
}

/**	
 * Copy role tags from grunddata1 tags to grunddata2 tags
 */
function getGrunddataTagsConnectorEnd(connector, source /* boolean */) {
	var tagsConnectorEnd = new Map();
	tagsConnectorEnd.set("definition (da)", upgradeStrings(getTaggedValueConnectorEnd(connector, "definition", source, "")));
	tagsConnectorEnd.set("comment (da)", getTaggedValueConnectorEnd(connector, "note", source, ""));
	tagsConnectorEnd.set("legalSource", getTaggedValueConnectorEnd(connector, "lovgrundlag", source, ""));
	tagsConnectorEnd.set("example (da)", getTaggedValueConnectorEnd(connector, "eksempel", source, ""));
	tagsConnectorEnd.set("altLabel (da)", getTaggedValueConnectorEnd(connector, "alternativtNavn", source, ""));
	return tagsConnectorEnd;
}

/**	
 * Copy role tags from grunddata1 tags to grunddata2 tags
 */
function setGrunddataTagsConnectorEnd(connector, source  /* boolean */, tagsConnectorEnd /* Map */) {
	setTaggedValueConnectorEnd(connector, "definition (da)", tagsConnectorEnd.get("definition (da)"), source);
	setTaggedValueConnectorEnd(connector, "comment (da)", tagsConnectorEnd.get("comment (da)"), source);
	setTaggedValueConnectorEnd(connector, "legalSource", tagsConnectorEnd.get("legalSource"), source);
	setTaggedValueConnectorEnd(connector, "example (da)", tagsConnectorEnd.get("example (da)"), source);
	setTaggedValueConnectorEnd(connector, "altLabel (da)", tagsConnectorEnd.get("altLabel (da)"), source);
}

/**	
 * Upgrade definitions to Modelregler v2.0 MDG
 */
function upgradeStrings(oldString) {

	var lowerCaseString = oldString.charAt(0).toLowerCase() + oldString.slice(1);
	var lastChar = lowerCaseString.slice(-1);
	if (lastChar == ".") {
		var removeLastCarString = lowerCaseString.slice(0, -1);
		return removeLastCarString;
	} else {
		return lowerCaseString;
	}

}


/**	
 * Upgrade diagrams to Modelregler v2.0 MDG
 */
function upgradeDiagrams(package /* EA.Package */ ) {
	var diagrams = getDiagramsOfPackageAndSubpackages(package);
	var diagram as EA.Diagram;
	var diagramId;
	var newStyleEx;
	var MDGDgm;


	for (var i in diagrams) {
		diagram = diagrams[i];

		LOGDebug("diagram Style1: " + diagram.StyleEx + " \n");
		diagramId = diagram.DiagramID;
		MDGDgm = false;

		const styleExArray = diagram.StyleEx.split(";");

		for (var j = 0; j < styleExArray.length; j++) {
			var styleExValue = styleExArray[j];
			if (styleExValue.includes("MDGDgm=")) {
				MDGDgm = true;
				LOGDebug("styleExArray " + j + " : " + styleExArray[j]);
				if (diagram.Type == "Package") {
					styleExArray[j] = "MDGDgm=Grunddatadiagrammer::Pakkediagram";
				} else {
					if (diagram.Name.includes("Oversigt")) {
						styleExArray[j] = "MDGDgm=Grunddatadiagrammer::Oversigtsdiagram";
					} else {
						styleExArray[j] = "MDGDgm=Grunddatadiagrammer::Objekttypediagram";
					}
				}
			}
		}

		if (MDGDgm == false) {
			styleExArray.push("MDGDgm=Grunddatadiagrammer::Objekttypediagram");
		}

		newStyleEx = styleExArray.join(";");
		LOGDebug("diagram Style2: " + newStyleEx + " \n");

		Repository.Execute("UPDATE t_diagram set StyleEx='" + newStyleEx + "' where Diagram_ID=" + diagramId + ";");

		LOGInfo("Changed diagram type of " + diagram.Name);
		diagramNumber++;
	}

}

main();
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
 * - updating the definitions and the description to start with a lower case character and to end without a full stop;
 * - creating classification models from enumeration, if wanted;
 * - updating the diagram types.
 *
 * Prerequisite: Grunddata2MDG.xml must be installed.
 *
 * Not all mandatory version 2 tags can be filled out from the version 1 tags, 
 * so for a model to be version 2 compliant, more tags must be filled out.
 *
 * @summary Upgrade a model from the UML profile of "Modelregler for Grunddata version 1" to the UML profile of "Modelregler for Grunddata version 2".
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	if (!Repository.IsTechnologyEnabled("Grunddata2")) {
		throw new Error("MDG Grunddata2 is not enabled");
	}
	// Get the currently selected package in the tree to work on
	var packageMain as EA.Package;
	packageMain = Repository.GetTreeSelectedPackage();
	if (packageMain != null && packageMain.ParentID != 0)
	{
		promptResult = Session.Prompt("Yes: Create classification models from enumerations\r\nNo: Keep enumerations i current model", promptYESNO);
		
		var packageElement as EA.Element;
		packageElement = packageMain.Element;
		packageElement.StereotypeEx = "DKDomænemodel";
		Repository.SynchProfile("Grunddata2", "DKDomænemodel");
		
		Session.Output("Upgrade model "+ packageElement.Name + " to modelregler for Grunddata version 2.0" );
		
		packageElement.Update;
		setGrunddata2PackageTags(packageElement);
		
		upgradeDiagrams(packageMain /* EA.Package */);
		
		var elements as EA.Collection;
		var currentElement as EA.Element;
		
		changeElementStereotypes(packageMain, packageMain);
		
		var packages as EA.Collection;
		var subpackage as EA.Package;
		packages = packageMain.Packages;
		for (var i = 0 ; i < packages.Count ; i++)
		{
			subpackage = packages.GetAt(i);	
			changeElementStereotypes(subpackage, packageMain);
		}
		
		
		Session.Output("\nSummary" );
		Session.Output("Changed MDG on "+ diagramNumber + " diagrams" );
		Session.Output("Changed stereotype on "+ elementNumber + " elements" );
		Session.Output("Changed stereotype on "+ attributeNumber + " attributes" );
		Session.Output("Changed tags on "+ enumNumber + " enums" );
		Session.Output("Changed stereotype on "+ roleNumber + " roles" );
		
		Repository.RefreshModelView(packageMain.PackageID);
				
	} else 
	{
		LOGError(MESSAGE_PACKAGE_REQUIRED);
	}
}


/**	
* Copies grunddata element tags to a temporary copy
*
*/
function changeElementStereotypes(currentPackage, packageMain)
{
		elements = currentPackage.Elements;
		
		for (var i = 0 ; i < elements.Count ; i++)
		{
			currentElement = elements.GetAt(i);
			
			Session.Output("Change Stereotype on: " + currentElement.Name + "Type: " + currentElement.Type + "Stereotype: " + currentElement.FQStereotype);
			if(currentElement.FQStereotype == "Grunddata::DKObjekttype" || currentElement.FQStereotype == "Geodata::DKFeaturetype" || currentElement.FQStereotype == "Geodata::DKObjekttype")
			{
				Session.Output("\nChange stereotype on: " + currentElement.Name );
				copyGrunddataTags(currentElement);
				currentElement.StereotypeEx = "Grunddata2::DKObjekttype";
				currentElement.Update();
				changeAttributeTags(currentElement);
				changeConnectorEndStereotype(currentElement);
				elementNumber++;
			}
			else if(currentElement.FQStereotype == "Grunddata::DKKodeliste")
			{
				Session.Output("\nChange stereotype on: " + currentElement.Name );
				copyGrunddataTags(currentElement);
				currentElement.StereotypeEx = "Grunddata2::DKKodeliste";
				currentElement.Update();
				elementNumber++;
			}
			else if(currentElement.FQStereotype == "Grunddata::DKDatatype")
			{
				Session.Output("\nChange stereotype on: " + currentElement.Name );
				copyGrunddataTags(currentElement);
				currentElement.StereotypeEx = "Grunddata2::DKDatatype";
				currentElement.Update();
				changeAttributeTags(currentElement);
				elementNumber++;
			}
			else if(currentElement.FQStereotype == "Grunddata::DKEnumeration" )
			{
				Session.Output("\nChange stereotype on: " + currentElement.Name );
				
				switch (promptResult) {
				case resultYes:
					var newPackage as EA.Package;
					newPackage = packageMain.Packages.AddNew(currentElement.Name, null );
				
					newPackage.Update();
					newPackage.StereotypeEx = "DKKlassifikationsmodel";
					newPackage.Update();
				
					Session.Output("  Create new Pakage DKKlassifikationsmodel: " + currentElement.Name );
				
					var PI = newPackage.PackageID;
				
					currentElement.PackageID = PI;
					case resultNo:
				}
				copyGrunddataTags(currentElement);

				currentElement.StereotypeEx = "Grunddata2::DKEnumeration";
				currentElement.Update();
				changeEnumTags(currentElement);
				elementNumber++;
			}
		}
		
		
		for (var j = 0 ; j < elements.Count ; j++)
		{
			currentElement = elements.GetAt(j);
			
			if(currentElement.FQStereotype == "Grunddata2::DKObjekttype" || currentElement.FQStereotype == "Grunddata2::DKEnumeration" || currentElement.FQStereotype == "Grunddata2::DKKodeliste" || currentElement.FQStereotype == "Grunddata2::DKDatatype")
			{
				//Session.Output("Copy tags on: " + currentElement.Name );
				
				var definition = getTaggedValueElement(currentElement, "definition_copy", "");
				setTaggedValueElement(currentElement, "definition (da)", definition);
				deleteTaggedValueElement(currentElement, "definition_copy");
				deleteTaggedValueElement(currentElement, "definition");
				
				var description = getTaggedValueElement(currentElement, "description_copy", "");
				setTaggedValueElement(currentElement, "comment (da)", description);
				deleteTaggedValueElement(currentElement, "description_copy");
				deleteTaggedValueElement(currentElement, "note");
				
				var legalSource = getTaggedValueElement(currentElement, "legalSource_copy", "");
				setTaggedValueElement(currentElement, "legalSource", legalSource);
				deleteTaggedValueElement(currentElement, "legalSource_copy");
				deleteTaggedValueElement(currentElement, "lovgrundlag");
				
				var example = getTaggedValueElement(currentElement, "example_copy", "");
				setTaggedValueElement(currentElement, "example (da)", example);
				deleteTaggedValueElement(currentElement, "example_copy");
				deleteTaggedValueElement(currentElement, "eksempel");
				
				var altLabel = getTaggedValueElement(currentElement, "alternativLabel_copy", "");
				setTaggedValueElement(currentElement, "altLabel (da)", altLabel);
				deleteTaggedValueElement(currentElement, "alternativLabel_copy");
				deleteTaggedValueElement(currentElement, "alternativtNavn");
			}
		}
	
	
	
	
}




/**	
* Copies grunddata element tags to a temporary copy
*
*/
function copyGrunddataTags(currentElement)
{
	var definition = getTaggedValueElement(currentElement, "definition", "");
	var newdefinition = upgradeStrings(definition);
	setTaggedValueElement(currentElement, "definition_copy", newdefinition);
	
	var description = getTaggedValueElement(currentElement, "note", "");
	var newddescription = upgradeStrings(description);
	addTaggedValueToElement(currentElement, "description_copy", "");
	changeTaggedValueElementFromSingleLineToMultiLine(currentElement, "description_copy")
	setTaggedValueElement(currentElement, "description_copy", newddescription);
	
	var legalSource = getTaggedValueElement(currentElement, "lovgrundlag", "");
	setTaggedValueElement(currentElement, "legalSource_copy", legalSource);
	
	var example = getTaggedValueElement(currentElement, "eksempel", "");
	setTaggedValueElement(currentElement, "example_copy", example);
	
	var alternativLabel = getTaggedValueElement(currentElement, "alternativtNavn", "");
	setTaggedValueElement(currentElement, "alternativLabel_copy", alternativLabel);
}

/**	
* Copies grunddata attribute tags to a temporary copy
*
*/
function copyGrunddataTagsAttribute(currentAttribute)
{
	var definition = getTaggedValueAttribute(currentAttribute, "definition", "");
	var newdefinition = upgradeStrings(definition);
	setTaggedValueAttribute(currentAttribute, "definition_copy", newdefinition);
	
	var description = getTaggedValueAttribute(currentAttribute, "note", "");
	var newddescription = upgradeStrings(description);
	addTaggedValueToAttribute(currentAttribute, "description_copy", "");
	changeTaggedValueAttributeFromSingleLineToMultiLine(currentAttribute, "description_copy");
	setTaggedValueAttribute(currentAttribute, "description_copy", newddescription);
	
	var legalSource = getTaggedValueAttribute(currentAttribute, "lovgrundlag", "");
	setTaggedValueAttribute(currentAttribute, "legalSource_copy", legalSource);
	
	var example = getTaggedValueAttribute(currentAttribute, "eksempel", "");
	setTaggedValueAttribute(currentAttribute, "example_copy", example);
	
	var alternativLabel = getTaggedValueAttribute(currentAttribute, "alternativtNavn", "");
	setTaggedValueAttribute(currentAttribute, "alternativLabel_copy", alternativLabel);
}


/**	
* Updates grunddata2 attribute tags from the temporary copy
*
*/
function updateGrunddata2TagsAttribute(currentAttribute)
{
	//Session.Output("currentAttribute update: " + currentAttribute.Name );
	
	var definition = getTaggedValueAttribute(currentAttribute, "definition_copy", "");
	setTaggedValueAttribute(currentAttribute, "definition (da)", definition);
	deleteTaggedValueAttribute(currentAttribute, "definition_copy");
	deleteTaggedValueAttribute(currentAttribute, "definition");
				
	var description = getTaggedValueAttribute(currentAttribute, "description_copy", "");
	setTaggedValueAttribute(currentAttribute, "comment (da)", description);
	deleteTaggedValueAttribute(currentAttribute, "description_copy");
	deleteTaggedValueAttribute(currentAttribute, "note");
			
	var legalSource = getTaggedValueAttribute(currentAttribute, "legalSource_copy", "");
	setTaggedValueAttribute(currentAttribute, "legalSource", legalSource);
	deleteTaggedValueAttribute(currentAttribute, "legalSource_copy");
	deleteTaggedValueAttribute(currentAttribute, "lovgrundlag");
				
	var example = getTaggedValueAttribute(currentAttribute, "example_copy", "");
	setTaggedValueAttribute(currentAttribute, "example (da)", example);
	deleteTaggedValueAttribute(currentAttribute, "example_copy");
	deleteTaggedValueAttribute(currentAttribute, "eksempel");
				
	var alternativLabel = getTaggedValueAttribute(currentAttribute, "alternativLabel_copy", "");
	setTaggedValueAttribute(currentAttribute, "altLabel (da)", alternativLabel);
	deleteTaggedValueAttribute(currentAttribute, "alternativLabel_copy");
	deleteTaggedValueAttribute(currentAttribute, "alternativtNavn");
	

}

/**	
* Change Stereotype on attributes from Grunddata::DKEgenskab to Grunddata2::DKEgenskab
*
*/
function changeAttributeTags(currentElement)
{
	var attributes as EA.Collection;
	attributes = currentElement.Attributes;
	for (var i = 0; i < attributes.Count; i++) 
	{
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt(i);
		Session.Output("  Change stereotype on attribute: " + currentAttribute.Name );
		
		copyGrunddataTagsAttribute(currentAttribute);
		
		currentAttribute.StereotypeEx = "Grunddata2::DKEgenskab";
		currentAttribute.Update();
		
		attributeNumber++;
	}
	
	Repository.SynchProfile("Grunddata2", "DKEgenskab");
	
	for (var j = 0; j < attributes.Count; j++) 
	{
		var currentAttribute as EA.Attribute;
		
		currentAttribute = attributes.GetAt(j);
		
		updateGrunddata2TagsAttribute(currentAttribute);
	}


}

/**	
* Change tags on enums from Grunddata::DKEgenskab to Grunddata2::DKEnumværdi
*
*/
function changeEnumTags(currentElement)
{
	var attributes as EA.Collection;
	attributes = currentElement.Attributes;
	for (var i = 0; i < attributes.Count; i++) 
	{
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt(i);
		Session.Output("  Change tags on enum: " + currentAttribute.Name );
		
		copyGrunddataTagsAttribute(currentAttribute);
		
		currentAttribute.StereotypeEx = "Grunddata2::DKEnumværdi";
		currentAttribute.Update();
	}
	
	Repository.SynchProfile("Grunddata2", "DKEnumværdi");
	
	for (var j = 0; j < attributes.Count; j++) 
	{
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt(j);
		updateGrunddata2TagsAttribute(currentAttribute);
	}
}

/**	
* Change stereotype on roles on association connectors from Grunddata::DKEgenskab to Grunddata2::DKEgenskab
*
*/
function changeConnectorEndStereotype(currentElement)
{
	var currentConnector as EA.Connector;
	var clientEnd as EA.ConnectorEnd;
	var supplierEnd as EA.ConnectorEnd;
	
	connectors = currentElement.Connectors;
	for (var i = 0 ; i < connectors.Count ; i++)
	{
		currentConnector = connectors.GetAt(i);
		if(currentConnector.Type == "Association" )
		{
			//Session.Output("  Association name: " + currentConnector.Name );
			
			if(connectorSet.has(currentConnector.ConnectorID) == false)
			{
				connectorSet.add(currentConnector.ConnectorID);
			
				clientEnd = currentConnector.ClientEnd;
			
				if(clientEnd.Role.length > 0)
				{
					clientEnd.StereotypeEx = "Grunddata2::DKEgenskab";
					clientEnd.Update();
					Repository.SynchProfile("Grunddata2", "DKEgenskab");
				
					changeConnectorEndTag(currentConnector, true);
				
					Session.Output("  Change stereotype on role: " + clientEnd.Role );
					roleNumber++;
				}
			
				supplierEnd = currentConnector.SupplierEnd;
			
				if(supplierEnd.Role.length > 0)
				{
					supplierEnd.StereotypeEx = "Grunddata2::DKEgenskab";
					supplierEnd.Update();
					Repository.SynchProfile("Grunddata2", "DKEgenskab");
					
					changeConnectorEndTag(currentConnector, false);
					
					Session.Output("  Change stereotype on role: " + supplierEnd.Role );
					roleNumber++;
				}
				currentConnector.Update();
			}
		}
	}
}
	
/**	
* Copy role tags from grunddata1 tags to grunddata2 tags
*
*/
function changeConnectorEndTag(connector, source)
{
	//Session.Output("currentAttribute update: " + currentAttribute.Name );
	
	var definition = getTaggedValueConnectorEnd(connector, "definition", source, "");
	var definitionnew = upgradeStrings(definition);
	if (definitionnew.length > 0)
	{
		//Session.Output("   Source " + source +"  Definition role: " + definition );
		setTaggedValueConnectorEnd(connector, "definition (da)", definitionnew, source)
	}
	deleteTaggedValueConnectorEnd(connector, "definition", source)
	
	var description = getTaggedValueConnectorEnd(connector, "note", source, "");
	var descriptionnew = upgradeStrings(description);
	if (descriptionnew.length > 0)
	{	
		setTaggedValueConnectorEnd(connector, "comment (da)", descriptionnew, source)
	}
	deleteTaggedValueConnectorEnd(connector, "note", source)
	
	var legalSource = getTaggedValueConnectorEnd(connector, "lovgrundlag", source, "");
	if (legalSource.length > 0)
	{
		setTaggedValueConnectorEnd(connector, "legalSource", legalSource, source)
	}
	deleteTaggedValueConnectorEnd(connector, "lovgrundlag", source)
	
	var example = getTaggedValueConnectorEnd(connector, "eksempel", source, "");
	if (example.length > 0)
	{
		setTaggedValueConnectorEnd(connector, "example (da)", example, source)
	}
	deleteTaggedValueConnectorEnd(connector, "eksempel", source)
		
	var alternativLabel = getTaggedValueConnectorEnd(connector, "alternativtNavn", source, "");
	if (example.length > 0)
	{
		setTaggedValueConnectorEnd(connector, "altLabel (da)", alternativLabel, source)
	}
	deleteTaggedValueConnectorEnd(connector, "alternativtNavn", source)
}

/**	
* Sets the Grunddata2 package tags using Grundata1 Tags
*
*/
function setGrunddata2PackageTags(currentPackageElement)
{
	var responsibleEntity = getTaggedValueElement(currentPackageElement, "registermyndighed", "");
	setTaggedValueElement(currentPackageElement, "responsibleEntity", responsibleEntity);
	deleteTaggedValueElement(currentPackageElement, "registermyndighed");
	
	var versionInfo = getTaggedValueElement(currentPackageElement, "version", "");
	setTaggedValueElement(currentPackageElement, "versionInfo", versionInfo);
	deleteTaggedValueElement(currentPackageElement, "version");
	
	deleteTaggedValueElement(currentPackageElement, "status");
	
	deleteTaggedValueElement(currentPackageElement, "modeldomæne");
	
	deleteTaggedValueElement(currentPackageElement, "forvaltingsopgave");
}

/**	
* Upgrade definitions and descriptions to Modelregler v2.0 MDG
*/
function upgradeStrings(oldString) { 
	
	var lowerCaseString = oldString.charAt(0).toLowerCase() + oldString.slice(1);
	var lastChar = lowerCaseString.slice(-1);
	if(lastChar == ".")
	{
		var removeLastCarString = lowerCaseString.slice(0, -1);
		return removeLastCarString;
	}
	else
	{
		return lowerCaseString;
	}
	
	}


/**	
* Upgrade diagrams to Modelregler v2.0 MDG
*/
function upgradeDiagrams(package /* EA.Package */) { 
	var diagrams = getDiagramsOfPackageAndSubpackages(package);
	var diagram as EA.Diagram;
	var diagramId;
	var newStyleEx;
	var MDGDgm;

	
	for (var i in diagrams)
	{
		diagram = diagrams[i];
		
		//Session.Output("diagram Style1: " + diagram.StyleEx + " \n" );
		diagramId = diagram.DiagramID;
		MDGDgm = false;
			
		const styleExArray = diagram.StyleEx.split(";");
			
		for (var j = 0 ; j < styleExArray.length ; j++)
		{	
			var styleExValue = styleExArray[j];
			if(styleExValue.includes("MDGDgm="))
			{
				MDGDgm = true;
				//Session.Output("styleExArray " +j + " : "+ styleExArray[j]  );
				if(diagram.Type == "Package")
				{
					styleExArray[j]="MDGDgm=Grunddatadiagrammer::Pakkediagram";
				}
				else
				{
					if(diagram.Name.includes("Oversigt"))
					{	
						styleExArray[j]="MDGDgm=Grunddatadiagrammer::Oversigtsdiagram";
					}
					else
					{
						styleExArray[j]="MDGDgm=Grunddatadiagrammer::Objekttypediagram";
					}
				}
			}
		}
		
		if (MDGDgm == false)
		{
			styleExArray.push("MDGDgm=Grunddatadiagrammer::Objekttypediagram");
		}
		
		newStyleEx = styleExArray.join(";");
		//Session.Output("diagram Style2: " + newStyleEx + " \n" );
			
		Repository.Execute("UPDATE t_diagram set StyleEx='"+ newStyleEx +"' where Diagram_ID=" + diagramId + ";");
		
		Session.Output("MDG for diagram updated : " + diagram.Name );
		diagramNumber++;
	}

}

main();
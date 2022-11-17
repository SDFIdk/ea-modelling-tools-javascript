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

/**
 * Change the stereotypes on package's, element's, attributes and roles from Grundata 1.2 uml-profile to the Grunddata 2.0 uml-profile.
 * Copies data for Grundata 1.2 tags to Grunddata 2.0 when posible
 * Diagrams are updated to to Grunddata version 2.0 MDG
 *
 * Requirement : Grunddata2MDG.xml needs to be installed for the script to work.
 *
 * Not all mandatory Grunddata 2.0 tags can be filled out from Grunddata 1.2 tags, so for a model to be Grunddata 2.0 compliant further Grunddata 2.0 tags needs to be set.
 *
 * @summary Upgrade a model from model rules	"modelregler for Grunddata version 1.2" 
 *							  to model rules	"modelregler for Grunddata version 2.0"
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	// Get the currently selected package in the tree to work on
	var packageMain as EA.Package;
	packageMain = Repository.GetTreeSelectedPackage();
	if (packageMain != null && packageMain.ParentID != 0)
	{
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
				copyGrunddataTags(currentElement)
				currentElement.StereotypeEx = "Grunddata2::DKObjekttype";
				currentElement.Update();
				changeAttributeTags(currentElement);
				changeConnectorEndStereotype(currentElement);
				elementNumber++;
			}
			else if(currentElement.FQStereotype == "Grunddata::DKKodeliste")
			{
				Session.Output("\nChange stereotype on: " + currentElement.Name );
				copyGrunddataTags(currentElement)
				currentElement.StereotypeEx = "Grunddata2::DKKodeliste";
				currentElement.Update();
				elementNumber++;
			}
			else if(currentElement.FQStereotype == "Grunddata::DKDatatype")
			{
				Session.Output("\nChange stereotype on: " + currentElement.Name );
				copyGrunddataTags(currentElement)
				currentElement.StereotypeEx = "Grunddata2::DKDatatype";
				currentElement.Update();
				changeAttributeTags(currentElement);
				elementNumber++;
			}
			else if(currentElement.FQStereotype == "Grunddata::DKEnumeration" )
			{
				Session.Output("\nChange stereotype on: " + currentElement.Name );
				var newPackage as EA.Package;
				newPackage = packageMain.Packages.AddNew(currentElement.Name, null );
				
				newPackage.Update();
				newPackage.StereotypeEx = "DKKlassifikationsmodel";
				newPackage.Update();
				
				Session.Output("  Create new Pakage DKKlassifikationsmodel: " + currentElement.Name );
				
				var PI = newPackage.PackageID;
				
				currentElement.PackageID = PI;
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
				
				var description = getTaggedValueElement(currentElement, "legalSource_copy", "");
				setTaggedValueElement(currentElement, "legalSource", description);
				deleteTaggedValueElement(currentElement, "legalSource_copy");
				deleteTaggedValueElement(currentElement, "lovgrundlag");
				
				var description = getTaggedValueElement(currentElement, "example_copy", "");
				setTaggedValueElement(currentElement, "example (da)", description);
				deleteTaggedValueElement(currentElement, "example_copy");
				deleteTaggedValueElement(currentElement, "eksempel");
				
				var description = getTaggedValueElement(currentElement, "alternativLabel_copy", "");
				setTaggedValueElement(currentElement, "altLabel (da)", description);
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
	setTaggedValueElement(currentElement, "definition_copy", definition);
	
	var description = getTaggedValueElement(currentElement, "note", "");
	setTaggedValueElement(currentElement, "description_copy", description);
	
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
	setTaggedValueAttribute(currentAttribute, "definition_copy", definition);
	
	var description = getTaggedValueAttribute(currentAttribute, "note", "");
	setTaggedValueAttribute(currentAttribute, "description_copy", description);
	
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
* Change tags on enums from Grunddata::DKEgenskab to Grunddata2::DKEgenskab
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
		
		currentAttribute.StereotypeEx = "Grunddata2::DKEgenskab";
		currentAttribute.Update();
	}
	
	Repository.SynchProfile("Grunddata2", "DKEgenskab");
	
	for (var j = 0; j < attributes.Count; j++) 
	{
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt(j);
		updateGrunddata2TagsAttribute(currentAttribute);
	}

	for (var i = 0; i < attributes.Count; i++) 
	{
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt(i);
	
		currentAttribute.StereotypeEx = "";
		currentAttribute.Update();
		
		enumNumber++;
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
	if (definition.length > 0)
	{
		//Session.Output("   Source " + source +"  Definition role: " + definition );
		setTaggedValueConnectorEnd(connector, "definition (da)", definition, source)
	}
	deleteTaggedValueConnectorEnd(connector, "definition", source)
	
	var description = getTaggedValueConnectorEnd(connector, "note", source, "");
	if (description.length > 0)
	{	
		setTaggedValueConnectorEnd(connector, "comment (da)", description, source)
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
* Upgade diagrams to Modelregler v2.0 MDG
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
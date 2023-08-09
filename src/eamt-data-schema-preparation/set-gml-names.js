!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var TAG_NAME_TRANSLITERATED_NAME = "transliteratedName";
var TAG_NAME_GIS_NAME = "gisName";
var TAG_NAME_GML_NAME = "gmlName";

/**
 * Adds tagged value "gmlName" containing the name to be used in the 
 * GML application schema for all relevant model elements (not on enumeration values).
 *
 * The GML name is set using the following logic: 
 *
 * ```mermaid
flowchart LR
    %% decisions
    gisNameSet{"Is tagged value<br />gisName set?"}
    transliteratedNameSet{Is tagged value<br />transliteratedName set?}
    %% outcomes
    useGisName[Use tagged value gisName as value of tagged value gmlName]
    usetransliteratedName[Use tagged value transliteratedName as value of tagged value gmlName]
    useModelElementName[Use model element name as value of tagged value gmlName]
    %% arrows
    Start --> gisNameSet
    gisNameSet --> | yes | useGisName --> End
    gisNameSet --> | no | transliteratedNameSet
    transliteratedNameSet --> | yes | usetransliteratedName --> End
    transliteratedNameSet --> | no | useModelElementName --> End
 ```
 *
 * Setting a GML name is useful when dealing with feature collections, 
 * where the GDAL/OGR [GML driver](https://gdal.org/drivers/vector/gml.html)
 * expects the property name for the feature collection member to end on "member" or "members".
 * 
 * By using those kinds of property names, at least support for GML in QGIS is better and thus more user-friendly.
 * See e.g. https://github.com/inspire-eu-validation/ets-repository/issues/142.
 * 
 * An example:
 *
 * ```mermaid
classDiagram
    class MyFeatureCollection {
        …
    }
    class MyFeature {
        …
    }
    MyFeatureCollection o--> "myFeature 0..*" MyFeature
```
 *
 *
 * When 
 *
 * 1. setting tagged value gisName = myFeatureMember for property myFeature
 * 2. using this script
 * 3. configuring ShapeChange to use the value of gmlName when present
 *
 * the GML application schema below is obtained.
 *
 * ```xml
 <!-- … -->
<element name="MyFeatureCollection" substitutionGroup="gml:AbstractFeature" type="ex:MyFeatureCollectionType">
</element>
<complexType name="MyFeatureCollectionType">
    <complexContent>
        <extension base="gml:AbstractFeatureType">
            <sequence>
                <!-- … -->
                <element maxOccurs="unbounded" minOccurs="0" name="myFeatureMember">
                    <complexType>
                        <complexContent>
                            <extension base="gml:AbstractFeatureMemberType">
                                <sequence>
                                    <element ref="ex:MyFeature"/>
                                </sequence>
                            </extension>
                        </complexContent>
                    </complexType>
                </element>
                <!-- … -->
            </sequence>
        </extension>
    </complexContent>
</complexType>
<!-- … -->
```
 *
 * A GML document specifying a feature collection of type `MyFeatureCollection`,
 * containing features of type `MyFeature`, will be recognized by
 * the GDAL/OGR [GML driver](https://gdal.org/drivers/vector/gml.html)
 * as having a layer called `MyFeature`, and its features can be visualized in QGIS 
 * without doing any modifications or transformations.
 *
 * For more information about GML feature collections, see section 9.9 in the
 * [GML 3.2.2 specification](https://portal.opengeospatial.org/files/?artifact_id=74183&version=2).
 *
 * @summary Adds tagged values with a GML name.
 */
function main() {
	// Show the script output window
	Repository.EnsureOutputVisible("Script");

	// Get the currently selected package in the tree to work on
	var aPackage as EA.Package;
	aPackage = Repository.GetTreeSelectedPackage();

	LOGInfo("=======================================");

	if (aPackage != null && aPackage.ParentID != 0) {
		LOGInfo("Working on package '" + aPackage.Name + "' (ID=" + aPackage.PackageID + ")");

		var elements as EA.Collection;
		var currentElement as EA.Element;
		var elements = getElementsOfPackageAndSubpackages(aPackage);
		for (var i = 0; i < elements.length; i++) {
			currentElement = elements[i];
			if (currentElement.Type == "Class" || currentElement.Type == "DataType") {
				setImplementationSchemaNameTaggedValueElement(currentElement);

				var attributes as EA.Collection;
				attributes = currentElement.Attributes;
				for (var j = 0; j < attributes.Count; j++) {
					var currentAttribute as EA.Attribute;
					currentAttribute = attributes.GetAt(j);
					setImplementationSchemaNameTaggedValueAttribute(currentAttribute);
				}

				var connectors as EA.Collection;
				connectors = currentElement.Connectors;
				for (var j = 0; j < connectors.Count; j++) {
					var currentConnector as EA.Connector;
					currentConnector = connectors.GetAt(j);
					var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, currentElement);
					if (proceed) {
						setImplementationSchemaNameTaggedValueConnectorEnd(currentConnector, true);
						setImplementationSchemaNameTaggedValueConnectorEnd(currentConnector, false);
					}
				}
			} else if (currentElement.Type == "Enumeration") {
				setImplementationSchemaNameTaggedValueElement(currentElement);
			}
		}
		LOGInfo("Done!");
	} else {
		LOGError(MESSAGE_PACKAGE_REQUIRED);
	}
}

function setImplementationSchemaNameTaggedValueElement(element) {
	LOGDebug("Element: " + element.Name);
	var explicitlyDefinedName, transliteratedName;
	explicitlyDefinedName = getTaggedValueElement(element, TAG_NAME_GIS_NAME, "");
	transliteratedName = getTaggedValueElement(element, TAG_NAME_TRANSLITERATED_NAME, "");
	var implementationSchemaName = getImplementationSchemaName(explicitlyDefinedName, transliteratedName, element.Name);
	setTaggedValueElement(element, TAG_NAME_GML_NAME, implementationSchemaName);
	LOGDebug("Implementation schema name: " + implementationSchemaName);
}

function getImplementationSchemaName(explicitlyDefinedName, transliteratedName, name) {
	var implementationSchemaName;
	if (explicitlyDefinedName != "") {
		implementationSchemaName = explicitlyDefinedName;
	} else if (transliteratedName != "") {
		implementationSchemaName = transliteratedName;
	} else {
		implementationSchemaName = name;
	}
	return implementationSchemaName;
}

function setImplementationSchemaNameTaggedValueAttribute(attribute) {
	LOGDebug("Attribute: " + attribute.Name);
	var explicitlyDefinedName, transliteratedName;
	explicitlyDefinedName = getTaggedValueAttribute(attribute, TAG_NAME_GIS_NAME, "");
	transliteratedName = getTaggedValueAttribute(attribute, TAG_NAME_TRANSLITERATED_NAME, "");
	var implementationSchemaName = getImplementationSchemaName(explicitlyDefinedName, transliteratedName, attribute.Name);
	setTaggedValueAttribute(attribute, TAG_NAME_GML_NAME, implementationSchemaName);
	LOGDebug("Implementation schema name: " + implementationSchemaName);
}

function setImplementationSchemaNameTaggedValueConnectorEnd(connector, source) {
	var roleName = null;
	if (source) {
		roleName = connector.ClientEnd.Role;
	} else {
		roleName = connector.SupplierEnd.Role;
	}
	LOGDebug("Connector end role: " + roleName);
	var explicitlyDefinedName, transliteratedName;
	explicitlyDefinedName = getTaggedValueConnectorEnd(connector, TAG_NAME_GIS_NAME, source, "");
	transliteratedName = getTaggedValueConnectorEnd(connector, TAG_NAME_TRANSLITERATED_NAME, source, "");
	var implementationSchemaName = getImplementationSchemaName(explicitlyDefinedName, transliteratedName, roleName);
	setTaggedValueConnectorEnd(connector, TAG_NAME_GML_NAME, implementationSchemaName, source);
	LOGDebug("Implementation schema name: " + implementationSchemaName);
}

main();
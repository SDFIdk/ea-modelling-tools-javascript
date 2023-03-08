!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var TAG_NAME_TRANSLITERATED_NAME = "transliteratedName";
var TAG_NAME_ORACLE_NAME = "oracleName";
var TAG_NAME_DATABASE_NAME = "dbName";
 
/**
 * Adds tagged value "dbName" containing the name to be used in the database 
 * for all relevant model elements (not on enumeration values).
 *
 * The database name is set using the following logic: 
 *
 * ```mermaid
flowchart LR
    %% decisions
    oracleNameSet{"Is tagged value<br />oracleName set?"}
    transliteratedNameSet{Is tagged value<br />transliteratedName set?}
    %% outcomes
    useOracleName[Use tagged value oracleName]
    usetransliteratedName[Use tagged value transliteratedName]
    useModelElementName[Use model element name]
    %% arrows
    Start --> oracleNameSet
    oracleNameSet --> | yes | useOracleName --> End
    oracleNameSet --> | no | transliteratedNameSet
    transliteratedNameSet --> | yes | usetransliteratedName --> End
    transliteratedNameSet --> | no | useModelElementName --> End
 ```
 *
 * A special mapping is done for the following attributes:
 *
 * - geometry → geometri
 * - beginLifespanVersion → registreringFra
 * - endLifespanVersion → registreringTil
 *
 * @summary Adds tagged values with database name
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
				setDatabaseNameTaggedValueElement(currentElement);

				var attributes as EA.Collection;
				attributes = currentElement.Attributes;
				for (var j = 0; j < attributes.Count; j++) {
					var currentAttribute as EA.Attribute;
					currentAttribute = attributes.GetAt(j);
					setDatabaseNameTaggedValueAttribute(currentAttribute);
				}

				var connectors as EA.Collection;
				connectors = currentElement.Connectors;
				for (var j = 0; j < connectors.Count; j++) {
					var currentConnector as EA.Connector;
					currentConnector = connectors.GetAt(j);
					var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, currentElement);
					if (proceed) {
						setDatabaseNameTaggedValueConnectorEnd(currentConnector, true);
						setDatabaseNameTaggedValueConnectorEnd(currentConnector, false);
					}
				}
			} else if (currentElement.Type == "Enumeration") {
				setDatabaseNameTaggedValueElement(currentElement);
			}
		}
		LOGInfo("Done!");
	} else {
		LOGError(MESSAGE_PACKAGE_REQUIRED);
	}
}

function setDatabaseNameTaggedValueElement(element) {
	LOGDebug("Element: " + element.Name);
	var oracleName, transliteratedName;
	oracleName = getTaggedValueElement(element, TAG_NAME_ORACLE_NAME, "");
	transliteratedName = getTaggedValueElement(element, TAG_NAME_TRANSLITERATED_NAME, "");
	var dbName = getDatabaseName(oracleName, transliteratedName, element.Name);
	setTaggedValueElement(element, TAG_NAME_DATABASE_NAME, dbName);
	LOGDebug("Database name: " + dbName);
}

function getDatabaseName(oracleName, transliteratedName, name) {
	var dbName;

	if (name == "geometry") {
		dbName = "geometri";
		LOGInfo("Special mapping used        Name: " + name + "   dbName: " + dbName);
	} else if (name == "lokalid") {
		dbName = "id_lokalid";
		LOGInfo("Special mapping used        Name: " + name + "   dbName: " + dbName);
	} else if (name == "beginLifespanVersion") {
		dbName = "registreringFra";
		LOGInfo("Special mapping used        Name: " + name + "   dbName: " + dbName);
	} else if (name == "endLifespanVersion") {
		dbName = "registreringTil";
		LOGInfo("Special mapping used        Name: " + name + "   dbName: " + dbName);
	} else if (oracleName != "") {
		dbName = oracleName;
		LOGInfo("Oracle name used           Name: " + name + "   dbName: " + dbName);
	} else if (transliteratedName != "") {
		dbName = transliteratedName;
		LOGInfo("Transliterated name used   Name: " + name + "   dbName: " + dbName);
	} else {
		dbName = name;
		if (dbName.length > 0) {
			LOGInfo("Standard name used           Name: " + name + "   dbName: " + dbName);
		}
	}
	return dbName;
}

function setDatabaseNameTaggedValueAttribute(attribute) {
	LOGDebug("Attribute: " + attribute.Name);
	var oracleName, transliteratedName;
	oracleName = getTaggedValueAttribute(attribute, TAG_NAME_ORACLE_NAME, "");
	transliteratedName = getTaggedValueAttribute(attribute, TAG_NAME_TRANSLITERATED_NAME, "");
	var dbName = getDatabaseName(oracleName, transliteratedName, attribute.Name);
	setTaggedValueAttribute(attribute, TAG_NAME_DATABASE_NAME, dbName);
	LOGDebug("Database name: " + dbName);
}

function setDatabaseNameTaggedValueConnectorEnd(connector, source) {
	var roleName = null;
	if (source) {
		roleName = connector.ClientEnd.Role;
	} else {
		roleName = connector.SupplierEnd.Role;
	}
	LOGDebug("Connector end role: " + roleName);
	var oracleName, transliteratedName;
	oracleName = getTaggedValueConnectorEnd(connector, TAG_NAME_ORACLE_NAME, source, "");
	transliteratedName = getTaggedValueConnectorEnd(connector, TAG_NAME_TRANSLITERATED_NAME, source, "");
	var dbName = getDatabaseName(oracleName, transliteratedName, roleName);
	setTaggedValueConnectorEnd(connector, TAG_NAME_DATABASE_NAME, dbName, source);
	LOGDebug("Database name: " + dbName);
}

main();
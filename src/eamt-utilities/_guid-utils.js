/**
 * @file This file contains utility functions to assist with working with UUIDs (universally unique identifiers).
 */

/**
 * @param guid {string} GUID (Microsoft UUID, enclosed in curly braces {})
 * @return {string} GUID without curly braces
 */
function convertGuidToStandardRepresentation(guid) {
	if (guid.length != 38) {
		var message = "Length of " + guid + " is not 38, expected a UUID surrounded with curly braces";
		throw message;
	}
	return guid.toLowerCase().substr(1,36);
}

/**
 * @param connectorGuid {string} GUID of the connector the connector end belongs to
 * @param source {boolean} whether the connector is the source (true) or the target (false) of the connector
 * @return GUID in XML of a connector end
 */
function determineGuidAsXMLOfConnectorEnd(connectorGuid /* string */, source /* boolean */) {
	var connectorGuidAsXML = Repository.GetProjectInterface().GUIDtoXML(connectorGuid);
	var connectorGuidAsXML;
	if (source) {
		connectorGuidAsXML = connectorGuidAsXML.substr(0, 5) + "src" + connectorGuidAsXML.substr(7);
	} else {
		connectorGuidAsXML = connectorGuidAsXML.substr(0, 5) + "dst" + connectorGuidAsXML.substr(7);
	}
	return connectorGuidAsXML;
	
}
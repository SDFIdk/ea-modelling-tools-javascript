!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var LOGLEVEL = LOGLEVEL_INFO;

var PROFILES_TAG = "profiles";
var PROFILES_SEPARATOR = ",";

var DEFAULT_VALUE_NO_TAG = "noprofiles";

/**
 * Adds a new profile to either all relevant elements and their properties in the selected package
 * or to the selected element and its properties.
 *
 * @summary Adds a new profile to model elements, if not yet present.
 */
function main() {
	// Show the script output window
	Repository.EnsureOutputVisible("Script");
	
	var profileToAdd = Session.Input("Give the name of the profile to add:");
	LOGInfo("Profile to add: " + profileToAdd);
	
	var treeSelectedType = Repository.GetTreeSelectedItemType();
    switch (treeSelectedType) {
		case otElement:
			var selectedElement as EA.Element;
			selectedElement = Repository.GetTreeSelectedObject();
			addProfileToElementAttributeAndConnectorEnds(selectedElement, profileToAdd);
			break;
		case otPackage:
			var selectedPackage as EA.Package;
			selectedPackage = Repository.GetTreeSelectedObject();
			addProfileToPackage(selectedPackage, profileToAdd);
			break;
		default: LOGWarn("This script requires a package or an element to be selected in the Browser");
	}
	LOGInfo("Done!");
}

function addProfileToPackage(aPackage, profileToAdd) {
	LOGInfo("Working on package '" + aPackage.Name + "' (ID=" + aPackage.PackageID + ")");
	var elements as EA.Collection;
	var currentElement as EA.Element;
	var elements = getElementsOfPackageAndSubpackages(aPackage);
	for (var i = 0; i < elements.length; i++) {
		currentElement = elements[i];
		addProfileToElementAttributeAndConnectorEnds(currentElement, profileToAdd);
	}
}

function addProfileToElementAttributeAndConnectorEnds(element, profileToAdd) {
	if (getDataModellingClassifiers().includes(element.Type)) {
		addProfileToElement(element, profileToAdd);
		
		var attributes as EA.Collection;
		attributes = element.Attributes;
		for (var j = 0; j < attributes.Count; j++) {
			var currentAttribute as EA.Attribute;
			currentAttribute = attributes.GetAt(j);
			addProfileToAttribute(currentAttribute, profileToAdd);
		}

		var connectors as EA.Collection;
		connectors = element.Connectors;
		for (var j = 0; j < connectors.Count; j++) {
			var currentConnector as EA.Connector;
			currentConnector = connectors.GetAt(j);
			if (isConnectorKindOfAssociation(currentConnector)) {
				var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, element);
				if (proceed) {
					addProfileToConnectorEnd(currentConnector, profileToAdd, true);
					addProfileToConnectorEnd(currentConnector, profileToAdd, false);
				}
			}
		}
	}
}

function addProfileToElement(element, profileToAdd) {
	var value = getTaggedValueElement(element, PROFILES_TAG, DEFAULT_VALUE_NO_TAG);
	if (value == DEFAULT_VALUE_NO_TAG || value.trim() == "") {
		setTaggedValueElement(element, PROFILES_TAG, profileToAdd);
	} else {
		var profiles = value.split(PROFILES_SEPARATOR);
		if (!profiles.includes(profileToAdd)) {
			profiles = profiles.concat(profileToAdd);
			setTaggedValueElement(element, PROFILES_TAG, profiles.join(PROFILES_SEPARATOR));
		}
	}
}

function addProfileToAttribute(attribute, profileToAdd) {
	var value = getTaggedValueAttribute(attribute, PROFILES_TAG, DEFAULT_VALUE_NO_TAG);
	if (value == DEFAULT_VALUE_NO_TAG || value.trim() == "") {
		setTaggedValueAttribute(attribute, PROFILES_TAG, profileToAdd);
	} else {
		var profiles = value.split(PROFILES_SEPARATOR);
		if (!profiles.includes(profileToAdd)) {
			profiles = profiles.concat(profileToAdd);
			setTaggedValueAttribute(attribute, PROFILES_TAG, profiles.join(PROFILES_SEPARATOR));
		}
	}
}

function addProfileToConnectorEnd(connector, profileToAdd, source) {
	var value = getTaggedValueConnectorEnd(connector, PROFILES_TAG, source, DEFAULT_VALUE_NO_TAG);
	if (value == DEFAULT_VALUE_NO_TAG || value.trim() == "") {
		setTaggedValueConnectorEnd(connector, PROFILES_TAG, profileToAdd, source);
	} else {
		var profiles = value.split(PROFILES_SEPARATOR);
		if (!profiles.includes(profileToAdd)) {
			profiles = profiles.concat(profileToAdd);
			setTaggedValueConnectorEnd(connector, PROFILES_TAG, profiles.join(PROFILES_SEPARATOR), source);
		}
	}
}

main();
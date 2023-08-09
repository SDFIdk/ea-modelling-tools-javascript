!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var LOGLEVEL = LOGLEVEL_INFO;

var PROFILES_TAG = "profiles";

/**
 * Adds tagged value "profiles" to the package and/or classifier (including the classifier's properties)
 * selected in the project browser, if that tagged value is not yet present.
 *
 * The value of tagged value "profiles" is set to an empty string, if the tagged value is not yet present.
 *
 * @summary Prepare a model for profiling.
 */
function main() {
	// Show the script output window
	Repository.EnsureOutputVisible("Script");
	LOGInfo("=======================================");
	
	var treeSelectedType = Repository.GetTreeSelectedItemType();
    switch (treeSelectedType) {
		case otElement:
			var selectedElement as EA.Element;
			selectedElement = Repository.GetTreeSelectedObject();
			addProfilesTagToElement(selectedElement);
			break;
		case otPackage:
			var selectedPackage as EA.Package;
			selectedPackage = Repository.GetTreeSelectedObject();
			addProfilesTagToPackage(selectedPackage);
			break;
		default: LOGWarn("This script requires a package or an element to be selected in the Browser");
	}
	LOGInfo("Done!");
}

function addProfilesTagToPackage(aPackage) {
	LOGInfo("Working on package '" + aPackage.Name + "' (ID=" + aPackage.PackageID + ")");
	var elements as EA.Collection;
	var currentElement as EA.Element;
	var elements = getElementsOfPackageAndSubpackages(aPackage);
	for (var i = 0; i < elements.length; i++) {
		currentElement = elements[i];
		addProfilesTagToElement(currentElement);
	}
}

function addProfilesTagToElement(element) {
	if (getDataModellingClassifiers().includes(element.Type)) {
		addTaggedValueToElement(element, PROFILES_TAG, "");
		
		var attributes as EA.Collection;
		attributes = element.Attributes;
		for (var j = 0; j < attributes.Count; j++) {
			var currentAttribute as EA.Attribute;
			currentAttribute = attributes.GetAt(j);
			addTaggedValueToAttribute(currentAttribute, PROFILES_TAG, "");
		}

		var connectors as EA.Collection;
		connectors = element.Connectors;
		for (var j = 0; j < connectors.Count; j++) {
			var currentConnector as EA.Connector;
			currentConnector = connectors.GetAt(j);
			if (isConnectorKindOfAssociation(currentConnector)) {
				var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, element);
				if (proceed) {
					if (currentConnector.ClientEnd.Navigable == "Navigable") {
						addTaggedValueToConnectorEnd(currentConnector, PROFILES_TAG, "", true);
					} else {
						deleteTaggedValueConnectorEnd(currentConnector, PROFILES_TAG, true);
					}
					if (currentConnector.SupplierEnd.Navigable == "Navigable") {
						addTaggedValueToConnectorEnd(currentConnector, PROFILES_TAG, "", false);
					} else {
						deleteTaggedValueConnectorEnd(currentConnector, PROFILES_TAG, false);
					}
				}
			}
		}
	}
}

main();
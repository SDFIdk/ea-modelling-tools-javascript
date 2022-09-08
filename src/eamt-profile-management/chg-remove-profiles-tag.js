!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var LOGLEVEL = LOGLEVEL_INFO;

var PROFILES_TAG = "profiles";

/**
 * Remove tagged value "profiles" from all relevant model elements of the
 * selected package.
 *
 * @summary Remove all information regarding profiles from the model.
 */
function main() {
	// Show the script output window
	Repository.EnsureOutputVisible("Script");

	// Get the currently selected package in the tree to work on
	var selectedPackage as EA.Package;
	selectedPackage = Repository.GetTreeSelectedPackage();

	LOGInfo("=======================================");

	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		LOGInfo("Working on package '" + selectedPackage.Name + "' (ID=" + selectedPackage.PackageID + ")");

		var elements as EA.Collection;
		var currentElement as EA.Element;
		var elements = getElementsOfPackageAndSubpackages(selectedPackage);
		for (var i = 0; i < elements.length; i++) {
			currentElement = elements[i];
			
			if (getDataModellingClassifiers().includes(currentElement.Type)) {
				deleteTaggedValueElement(currentElement, PROFILES_TAG);
				
				var attributes as EA.Collection;
				attributes = currentElement.Attributes;
				for (var j = 0; j < attributes.Count; j++) {
					var currentAttribute as EA.Attribute;
					currentAttribute = attributes.GetAt(j);
					deleteTaggedValueAttribute(currentAttribute, PROFILES_TAG);
				}

				var connectors as EA.Collection;
				connectors = currentElement.Connectors;
				for (var j = 0; j < connectors.Count; j++) {
					var currentConnector as EA.Connector;
					currentConnector = connectors.GetAt(j);
					var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, currentElement);
					if (proceed) {
						deleteTaggedValueConnectorEnd(currentConnector, PROFILES_TAG, true);
						deleteTaggedValueConnectorEnd(currentConnector, PROFILES_TAG, false);
					}
				}
			}
		}
		LOGInfo("Done!");
	} else {
		LOGError(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();
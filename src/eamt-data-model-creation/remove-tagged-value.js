!INC eamt-utilities._command-line-utils
!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils
 
/**
 * Removes all tagged values with the name given via user input, from all classifiers
 * used in data modelling, and from their properties, 
 * in the selected package and its subpackages.
 *
 * @summary Remove tagged value from the model
 */
function main() {
	// Show the script output window
	Repository.EnsureOutputVisible("Script");

	// Get the currently selected package in the tree to work on
	var aPackage as EA.Package;
	aPackage = Repository.GetTreeSelectedPackage();

	LOGInfo("=======================================");

	if (aPackage != null && aPackage.ParentID != 0) {
		LOGInfo("Working on aPackage '" + aPackage.Name + "' (ID=" + aPackage.PackageID + ")");

		var taggedValue = Session.Input("Tagged value to remove");
		if (taggedValue == null || taggedValue == "") {
			LOGWarning("No tagged value given");
			return;
		} else {
			LOGInfo("Tagged value to remove: " + taggedValue);
		}

		var elements as EA.Collection;
		var currentElement as EA.Element;
		var elements = getElementsOfPackageAndSubpackages(aPackage);
		for (var i = 0; i < elements.length; i++) {
			currentElement = elements[i];
			if (getDataModellingClassifiers().includes(currentElement.Type)) {
				deleteTaggedValueElement(currentElement, taggedValue);

				var attributes as EA.Collection;
				attributes = currentElement.Attributes;
				for (var j = 0; j < attributes.Count; j++) {
					var currentAttribute as EA.Attribute;
					currentAttribute = attributes.GetAt(j);
					deleteTaggedValueAttribute(currentAttribute, taggedValue);
				}

				var connectors as EA.Collection;
				connectors = currentElement.Connectors;
				for (var j = 0; j < connectors.Count; j++) {
					var currentConnector as EA.Connector;
					currentConnector = connectors.GetAt(j);
					var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, currentElement);
					if (proceed) {
						deleteTaggedValueConnectorEnd(currentConnector, taggedValue, true);
						deleteTaggedValueConnectorEnd(currentConnector, taggedValue, false);
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
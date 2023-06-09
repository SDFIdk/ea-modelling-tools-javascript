!INC eamt-utilities._logging-utils
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

/**
 * Converts single-line tagged values with the given name to multi-line tagged values,
 * also knows as "memo" tagged values.
 *
 * This can be useful when a custom tagged value, not related to a MDG; has been added to 
 * model elements, and it becomes clear that it has to be able to contain a lot of text
 * and/or line breaks and new lines.
 *
 * @summary Converts single-line tagged values to multi-line tagged values
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

        var taggedValueName = Session.Input("Tagged value to update");
        if (taggedValueName == null || taggedValueName == "") {
            throw new Error("No tagged value given");
        } else {
            LOGInfo("Tagged value to update: " + taggedValueName);
        }

        var elements as EA.Collection;
        var currentElement as EA.Element;
        var elements = getElementsOfPackageAndSubpackages(aPackage);
        for (var i = 0; i < elements.length; i++) {
            currentElement = elements[i];
            if (getDataModellingClassifiers().includes(currentElement.Type)) {
                changeTaggedValueElementFromSingleLineToMultiLine(currentElement, taggedValueName);

                var attributes as EA.Collection;
                attributes = currentElement.Attributes;
                for (var j = 0; j < attributes.Count; j++) {
                    var currentAttribute as EA.Attribute;
                    currentAttribute = attributes.GetAt(j);
                    changeTaggedValueAttributeFromSingleLineToMultiLine(currentAttribute, taggedValueName);
                }

                var connectors as EA.Collection;
                connectors = currentElement.Connectors;
                for (var j = 0; j < connectors.Count; j++) {
                    var currentConnector as EA.Connector;
                    currentConnector = connectors.GetAt(j);
                    var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, currentElement);
                    if (proceed) {
                        changeTaggedValueConnectorEndFromSingleLineToMultiLine(currentConnector, taggedValueName, true);
                        changeTaggedValueConnectorEndFromSingleLineToMultiLine(currentConnector, taggedValueName, false);
                    }
                }
            }
        }
        LOGInfo("Done!");
    } else {
        throw new Error(MESSAGE_PACKAGE_REQUIRED);
    }
}

main();
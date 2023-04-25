!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var SEQUENCE_NUMBER_TAG_NAME = "sequenceNumber";
var TAGGED_VALUE_NOT_PRESENT_VALUE = "N/A";

/**
 * Validates that a tagged value sequenceNumber is set on the end of outgoing associations of elements
 * that have more than one outgoing association and that no properties have the same sequenceNumber.
 *
 * ShapeChange ensures that in a case where sequence numbers aren't explicitly set,
 * attributes are placed in front of association roles by giving attributes a sufficiently
 * low sequence number. Therefore, it is sufficient to have sequence numbers on associations ends only,
 * attributes do not need sequence numbers (but may have sequence numbers).
 *
 * @summary Validates sequence numbers.
 */
function main() {
	Repository.EnsureOutputVisible("Script");

	var selectedPackage as EA.Package;
	selectedPackage = Repository.GetTreeSelectedPackage();

	LOGInfo("=======================================");
	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		LOGInfo("Working on package '" + selectedPackage.Name + "' (ID=" + selectedPackage.PackageID + ")");
		validateSequenceNumbersPackage(selectedPackage);
		LOGInfo("Done.");
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

/**
 * Main validation method, can be called from other scripts.
 *
 * Returns whether or not the validation succeeded.
 */
function validateSequenceNumbersPackage(selectedPackage /* EA.Package */ ) {
	/*: boolean */
	LOGInfo("=== Validation results ===");
	var noOfErrorsFound = 0;
	var elements = getElementsOfPackageAndSubpackages(selectedPackage);
	var element as EA.Element;
	for (var i in elements) {
		element = elements[i];
		if (getDataModellingClassifiers().includes(element.Type)) {
			LOGInfo("Validating " + element.Name);
			var connectorEnds = getNonInHeritedPropertiesThatAreAssociationEnds(element);
			if (connectorEnds.size > 1) {
				noOfErrorsFound = noOfErrorsFound + validateSequenceNumbersElement(element);
			}
		}
	}
	LOGInfo(noOfErrorsFound + " error(s) found in the sequence numbers.");
}

function validateSequenceNumbersElement(element /* EA.Element */ ) {
	/*: integer */
	LOGInfo("Validating " + element.Name + " because it has more than 1 outgoing association.");

	var sequenceNumbers = new Map();
	var noOfErrorsFound = 0;

	var associationEnds = getNonInHeritedPropertiesThatAreAssociationEnds(element);
	LOGDebug("Number of association ends for " + element.Name + ": " + associationEnds.size);
	var associationEnd as EA.ConnectorEnd;
	for (var [connectorId, associationEnd] of associationEnds) {
		var associationEndQualifiedName = element.Name + "::" + associationEnd.Role;
		LOGDebug("Connector id: " + connectorId);
		var taggedValue = getTaggedValueConnectorEnd(Repository.GetConnectorByID(connectorId), SEQUENCE_NUMBER_TAG_NAME, associationEnd.End == "Client", TAGGED_VALUE_NOT_PRESENT_VALUE);
		LOGInfo(SEQUENCE_NUMBER_TAG_NAME + " for " + associationEndQualifiedName + "=" + taggedValue);
		if (taggedValue == TAGGED_VALUE_NOT_PRESENT_VALUE) {
			LOGError("Association end " + associationEndQualifiedName + " has no tagged value sequence number");
			noOfErrorsFound++;
		} else {
			if (sequenceNumbers.has(taggedValue)) {
				LOGError("sequenceNumber=" + taggedValue + " for properties " + sequenceNumbers.get(taggedValue) + " and " + associationEnd.Role);
				noOfErrorsFound++;
			} else {
				sequenceNumbers.set(taggedValue, associationEndQualifiedName);
			}
		}
	}

	var attributes = element.Attributes;
	var attribute as EA.Attribute;

	for (var i = 0; i < attributes.Count; i++) {
		attribute = attributes.GetAt(i);
		var attributeName = element.Name + "::" + attribute.Name;
		var taggedValue = getTaggedValueAttribute(attribute, SEQUENCE_NUMBER_TAG_NAME, TAGGED_VALUE_NOT_PRESENT_VALUE);
		if (taggedValue == TAGGED_VALUE_NOT_PRESENT_VALUE) {
			// ok, see documentation script
		} else {
			if (sequenceNumbers.has(taggedValue)) {
				LOGError("sequenceNumber=" + taggedValue + " for properties " + sequenceNumbers.get(taggedValue) + " and " + attributeName);
				noOfErrorsFound++;
			} else {
				sequenceNumbers.set(taggedValue, attributeName);
			}
		}
	}

	return noOfErrorsFound;
}

main();
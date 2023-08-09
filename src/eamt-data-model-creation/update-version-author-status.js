!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._tagged-values-utils

var newVersion;
var newAuthor;
var newStatus;

/**
 * Updates the version, author and status on all elements in this package and subpackages.
 *
 * If the package has stereotype Grunddata::DKDomænemodel, the tagged value version is updated.
 *
 * If the package has stereotype Grunddata2::DKDomænemodel, 
 * the tagged values versionInfo and responsibleEntity are updated.
 *
 * Packages with other stereotypes are not supported.
 *
 * @summary Updates the version, author and status.
 */
function main() {
	// Show the script output window
	Repository.EnsureOutputVisible("Script");

	// Get the currently selected package in the tree to work on
	var selectedPackage as EA.Package;
	selectedPackage = Repository.GetTreeSelectedPackage();

	LOGInfo("=======================================");

	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		var testElementID = 0;

		LOGInfo("=======================================");
		LOGInfo("Working on package '" + selectedPackage.Name + "' (ID=" +
			selectedPackage.PackageID + ")");

		requestInput(selectedPackage);
		updateVersionAuthorAndStatus(selectedPackage);
		var subPackage as EA.Package;
		for (var i = 0; i < selectedPackage.Packages.Count; i++) {
			subPackage = selectedPackage.Packages.GetAt(i);
			updateVersionAuthorAndStatus(subPackage);
		}

		LOGInfo("Done!");
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

function requestInput(selectedPackage) {
	if (selectedPackage.Element.HasStereotype("Grunddata::DKDomænemodel") 
		|| selectedPackage.Element.HasStereotype("Grunddata2::DKDomænemodel")) {
	} else {
		LOGError("Package " + selectedPackage.Element.Name + " has stereotype(s)" +	selectedPackage.Element.StereotypeEx);
		LOGError("It should have stereotype Grunddata::DKDomænemodel or Grunddata2::DKDomænemodel");
		throw new Error("Wrong package stereotype");
	}
	
	newStatus = Session.Input("Status of " + selectedPackage.Name + " (Approved or Proposed)");
	if (newStatus != 'Approved' && newStatus != 'Proposed') {
		throw new Error("Wrong new status '" + newStatus + "', should be 'Approved' or 'Proposed'");
	}
	
	newVersion = Session.Input("Version of " + selectedPackage.Name);
	if (newVersion.length == 0) {
		throw new Error("No version given");
	}
	newAuthor = Session.Input("Author of " + selectedPackage.Name);
	if (newAuthor.length == 0) {
		throw new Error("No author given");
	}
}

function updateVersionAuthorAndStatus(aPackage) {
	setFieldsOnPackage(aPackage);

	var elements as EA.Collection;
	elements = aPackage.Elements;
	for (var i = 0; i < elements.Count; i++) {
		var currentElement as EA.Element;
		currentElement = elements.GetAt(i);
		setFieldsOnElement(currentElement);
	}
	aPackage.Elements.Refresh();

	var diagrams as EA.Collection;
	diagrams = aPackage.Diagrams;
	for (var i = 0; i < diagrams.Count; i++) {
		var currentDiagram as EA.Diagram;
		currentDiagram = diagrams.GetAt(i);
		setFieldsOnDiagram(currentDiagram);
	}
	aPackage.Diagrams.Refresh();
}

function setFieldsOnPackage(aPackage) {
	aPackage.Element.Author = newAuthor;
	aPackage.Version = newVersion;
	aPackage.Element.Status = newStatus;
	if (aPackage.Element.HasStereotype("Grunddata::DKDomænemodel")) {
		setTaggedValueElement(aPackage.Element, "version", newVersion);
	} else if (aPackage.Element.HasStereotype("Grunddata2::DKDomænemodel")) {
		setTaggedValueElement(aPackage.Element, "versionInfo", newVersion);
		setTaggedValueElement(aPackage.Element, "responsibleEntity", newAuthor);
	}
	aPackage.Element.Update();
	aPackage.Update();
	aPackage.Element.Refresh();
	LOGDebug("Set author, version and status on: " + aPackage.Name);
}

function setFieldsOnElement(element) {
	element.Author = newAuthor;
	element.Version = newVersion;
	element.Status = newStatus;
	element.Update();
	LOGDebug("Set author, version and status on: " + element.Name);
}

function setFieldsOnDiagram(diagram) {
	diagram.Author = newAuthor;
	diagram.Version = newVersion;
	diagram.Update();
	LOGDebug("Set author and version on: " + diagram.Name);
}

main();
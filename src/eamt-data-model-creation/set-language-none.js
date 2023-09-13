!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils

var LOGLEVEL = LOGLEVEL_INFO;

var NO_LANGUAGE = "<none>";

/**
 * Sets the language of all clasess, datatypes, enumerations, interfaces and packages
 * in the selected package to `<none>`, to indicate that the model element is not language-specific.
 */
function main() {
	Repository.EnsureOutputVisible("Script");

	var aPackage as EA.Package;
	aPackage = Repository.GetTreeSelectedPackage();
	
	LOGInfo("=======================================");
	if (aPackage != null && aPackage.ParentID != 0) {
		LOGInfo("Working on package '" + aPackage.Name + "' (ID=" + aPackage.PackageID + ").");
		var elements = getElementsOfPackageAndSubpackages(aPackage);
		var element as EA.Element;
		for (var i in elements) {
			element = elements[i];
			if (element.Type == "Class" || element.Type == "Enumeration" || element.Type == "DataType" || element.Type == 'Interface') {
				element.Gentype = NO_LANGUAGE;
				element.Update();
				element.Refresh();
				LOGDebug("Set language to " + NO_LANGUAGE + " on " + element.Name);
			}
		}
		var packages = getSubpackagesOfPackage(aPackage).concat(aPackage);
		var element as EA.Element;
		for (var i in packages) {
			element = packages[i].Element;
			element.Gentype = NO_LANGUAGE;
			element.Update();
			element.Refresh();
			LOGDebug("Set language to " + NO_LANGUAGE + " on " + aPackage.Name);
		}
		LOGInfo("Done.")
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();
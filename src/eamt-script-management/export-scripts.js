!INC eamt-utilities._logging-utils
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._command-line-utils

var LOGLEVEL = LOGLEVEL_INFO;

/**
 * Exports the scripts in one or more scripts groups as
 *
 * 1. a EA reference data file for import in another EA instance 
 * 2. seperate script files
 * 3. a separate README.md file, containing the documentation extracted from the scripts
 *
 * The name/regex is used in a LIKE expression in the database of EA project file.
 *
 * For .qea files, see [the LIKE operator in SQLite](https://sqlite.org/lang_expr.html#the_like_glob_regexp_match_and_extract_operators).
 *
 * For .eapx files, see
 * [the LIKE operator in Microsoft Jet SQL](https://docs.microsoft.com/en-us/previous-versions/office/developer/office2000/aa140015(v=office.10)#the-like-operator)
 * Note that an asterisk (*) in a regex must be escaped with a backslash. So use `xyz\*` instead of `xyz*` to export all script groups that have a name starting with xyz.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	// a backslash must be escaped in Javascript, therefore two backslashes
	var scriptGroupNameOrRegex = Session.Input("Script group name or regex for a collection of scripts groups");
	if (scriptGroupNameOrRegex.length == 0) {
		LOGError("No script group given");
		return;
	}
	
	var scriptFolderPath = chooseFolderWithUI("Folder in which the script files should be saved");
	if (scriptFolderPath.length == 0) {
		LOGError("No folder path given");
		return;
	}
	
	runBatFileInDefaultWorkingDirectory("export-scripts.bat", '-sg "' + scriptGroupNameOrRegex + '" -o ' + scriptFolderPath + " -p 5");
	
	openFolderInWindowsExplorer(scriptFolderPath);
}

main();
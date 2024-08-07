/**
 * @file This file contains functions to provide the "glue" between a script in EA and a .bat file calling e.g. Java code.
 */
 !INC eamt-utilities._logging-utils

/**
 * Provides access to aspects of the Windows Shell, such as applications, shortscuts, environment variables,
 * the registry, and operating environment (from "Windows Powershell Pocket References" by Lee Holmes).
 *
 * See more on [WshShell Object](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/aew9yb99(v=vs.84))
 */
var WSH_SHELL = new COMObject("WScript.Shell");

/*
 * Possible values for the type of popup (WSH_SHELL.Popup). Values can be added up to combine them.
 * See https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/x83z1d9f(v=vs.84).
 */
var PT_OK = 0;
var PT_OKCANCEL = 1;
var PT_ABORTRETRYIGNORE = 2;
var PT_YESNOCANCEL = 3;
var PT_YESNO = 4;
var PT_RETRYCANCEL = 5;
var PT_CANCELTRYCONTINUE = 6;
var PT_ICONSTOP = 16;
var PT_ICONQUESTION = 32;
var PT_ICONEXCLAMATION = 48;
var PT_ICONINFORMATION = 64;
var PT_DEFBUTTON2 = 256;
var PT_DEFBUTTON3 = 512;

/*
 * Possible return values of WSH_SHELL.Popup method.
 * See https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/x83z1d9f(v=vs.84).
 */
var BTN_NONECLICKED = -1;
var BTN_OK = 1;
var BTN_CANCEL = 2;
var BTN_ABORT = 3;
var BTN_RETRY = 4;
var BTN_IGNORE = 5;
var BTN_YES = 6;
var BTN_NO = 7;
var BTN_TRYAGAIN = 10;
var BTN_CONTINUE = 11;

/**
 * @param {string} batFileToInvoke the .bat file to be invoked
 * @param {string} arguments to give to the .bat file
 */
function runBatFileInDefaultWorkingDirectory(batFileToInvoke, programArguments) {
	runBatFileInSpecifiedWorkingDirectory(WSH_SHELL.ExpandEnvironmentStrings("%EAMT_HOME%"), batFileToInvoke, programArguments);
}

/**
 * @param {string} workingDirectory working directory
 * @param {string} batFileToInvoke the .bat file to be invoked
 * @param {string} arguments to give to the .bat file
 */
function runBatFileInSpecifiedWorkingDirectory(workingDirectory, batFileToInvoke, programArguments) {
	var processId = determineProcessId(workingDirectory);
	if (processId != "-1") {
		runBatFileInSpecifiedWorkingDirectoryWithProcessId(workingDirectory, batFileToInvoke, processId, programArguments);
	} else {
		throw new Error("Cannot proceed, stopping here.");
	}
}

/**
 * @param {string} workingDirectory working directory
 * @param {string} batFileToInvoke the .bat file to be invoked
 * @param {string} processId the process id of the running EA instance
 * @param {string} arguments to give to the .bat file
 * @private
 */
function runBatFileInSpecifiedWorkingDirectoryWithProcessId(workingDirectory, batFileToInvoke, processId, programArguments) {
	verifyEaModellingToolsJavaInstallation();
	var command = '"' + WSH_SHELL.ExpandEnvironmentStrings("%EAMT_HOME%") + '\\bin\\' + batFileToInvoke + '"' + " -eapid " + processId + " " + programArguments;
	runCommand(workingDirectory, command);
	LOGInfo("In case of unexpected or no results, check the log file in " + WSH_SHELL.ExpandEnvironmentStrings("%EAMT_HOME%") + "\\log\\" + " for details about the execution");
}

/**
 * Determines the process id of the running EA instance based on the Windows tasklist command.
 *
 * @return {string} process id of the running EA instance
 */
function determineProcessId() {
	var processId;
	var command = 'TASKLIST /V /FO CSV /NH /FI "IMAGENAME eq EA.exe" /FI "WINDOWTITLE eq ' + getWindowTitleForInstanceOfEA() + '"';
	LOGInfo(command);
	var wse = WSH_SHELL.Exec(command); // returns WshScriptExec Object, see https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/2f38xsxe%28v%3dvs.84%29
	while (wse.Status == 0) {
		LOGInfo("Retrieving process id");
		// alternative way of "sleeping"
		// see also https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/x83z1d9f%28v%3dvs.84%29
		// see also http://www.sparxsystems.com/forums/smf/index.php/topic,6063.msg127934.html
		WSH_SHELL.Popup("Retrieving process id", 1, "Info message", PT_OK + PT_ICONINFORMATION);
	}
	if (!wse.StdOut.AtEndOfStream) {
		var output = wse.StdOut.ReadAll();
		LOGInfo(output);
		if (output.indexOf("No tasks are running which match the specified criteria") != -1) {
			throw new Error("Is the command correct? Check the script.");
			processId = "-1";
		} else if (output.search(/\n"EA.exe"/g) != -1) {
			throw new Error("More than one task found. Is the command correct? Check the script.");
			processId = "-1";
		} else {
			// process id is the second value: "EA.exe","4852",...
			outputAsArray = output.split(",");
			processIdWithQuotes = outputAsArray[1];
			processId = processIdWithQuotes.substring(1, processIdWithQuotes.lastIndexOf('"'));
			LOGInfo("process id=" + processId);
		}
	}
	if (!wse.StdErr.AtEndOfStream) {
		LOGError(wse.StdErr.ReadAll());
		processId = -1;
	}
	return processId;
}

/**
 * Use for calling Java, that writes the output back to the Script window.
 * 
 * @param directory {string}
 * @param command {string}
 */
function runCommand(directory, command) {
	WSH_SHELL.CurrentDirectory = directory;
	LOGInfo("Current directory: "+ WSH_SHELL.CurrentDirectory);
	LOGInfo("Command to run: ");
	LOGInfo(command);

	/*
	 * The Run command returns an integer.
	 * The 3rd argument is true: wait for the program to finish executing before continuing to the next statement in your script.
	 * See https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/d5fk67ky(v=vs.84)
	 */
	var result = WSH_SHELL.Run(command, 1, true);
	if (result == 0) {
		LOGInfo("The command below was called successfully.");
		LOGInfo(command);
	} else {
		LOGError("The command below was not called successfully, executing it (again) to see its output");
		LOGInfo(command);
		var wse = WSH_SHELL.Exec(command, 1, true);
		if (wse == null) {
			LOGError("The command could not be run at all");
			throw new Error("Have you installed the latest version of the EA Modelling Tools Java? You seem to try to execute a batch file that does not exist yet in your installation (command: " + command + ").");
		} else {
			while (wse.Status == 0) {
				LOGInfo("Executing command");
				// alternative way of "sleeping"
				// see also https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/x83z1d9f%28v%3dvs.84%29
				// see also http://www.sparxsystems.com/forums/smf/index.php/topic,6063.msg127934.html
				WSH_SHELL.Popup("Executing command", 1, "Info message", PT_OK + PT_ICONINFORMATION);
			}
			if (!wse.StdOut.AtEndOfStream) {
				LOGInfo(wse.StdOut.ReadAll());
			}
			if (!wse.StdErr.AtEndOfStream) {
				var errorOutput = wse.StdErr.ReadAll();
				LOGError(errorOutput);
				if (errorOutput.indexOf("UnsupportedClassVersionError") != -1) {
					throw new Error("You seem to be using an unsupported Java version. Double-check the instructions regarding installation and setting of the user environment variables for the EA Modelling Tools Java.")
				}
			}
		}
	}
}

/**
 * Executes a command in the given directory (currently not used, kept for reference, comes from the earlier _ShellHelperFunctions)
 *
 * @param directory {string}
 * @param command {string}
 * @return {boolean} whether or not the command finished successfully
 */
function executeCommand(directory, command) {
	var commandFinishedSuccessfully = true;
	
	WSH_SHELL.CurrentDirectory = directory;
	LOGInfo("Current directory: "+ WSH_SHELL.CurrentDirectory);

	var wse = WSH_SHELL.Exec(command);
	while (wse.Status == 0) {
		// see also https://msdn.microsoft.com/en-us/library/x83z1d9f(v=vs.84).aspx
		// see also http://www.sparxsystems.com/forums/smf/index.php/topic,6063.msg127934.html
		var message = 'Waiting for command "' + command + '" to finish.';
		LOGInfo(message);
		// alternative way of "sleeping"
		WSH_SHELL.Popup(message, 1, "Info message", PT_OK + PT_ICONINFORMATION);
	}
	if (!wse.StdOut.AtEndOfStream) {
		LOGInfo(wse.StdOut.ReadAll());
	}
	if (!wse.StdErr.AtEndOfStream) {
		LOGError(wse.StdErr.ReadAll());
		commandFinishedSuccessfully = false;
	}
	return commandFinishedSuccessfully;
}

/**
 * @return {string} "test - Enterprise Architect" when the model is located in C:\Users\username\Documents\test.eapx
 * @private
 */
function getWindowTitleForInstanceOfEA() {
	var windowTitle = getFileNameWithoutExtensionForInstanceOfEA() + " - Enterprise Architect";
	return windowTitle;
}

/**
 * @return {string} "test" when the full path is C:\Users\username\Documents\test.eapx
 * @private
 */
function getFileNameWithoutExtensionForInstanceOfEA() {
	var connectionString = Repository.ConnectionString;
	LOGInfo(connectionString);
	var fileName = connectionString.substring(connectionString.lastIndexOf("\\") + 1, connectionString.lastIndexOf("."));
	return fileName;
}

/*
 * Verifies that the environment variable EAMT_HOME is set, which is an indication
 * that the EA Modelling Tools Java have been correctly installed.
 */
function verifyEaModellingToolsJavaInstallation() {
	var locationDMT = WSH_SHELL.ExpandEnvironmentStrings("%EAMT_HOME%");
	LOGInfo("EAMT_HOME: " + locationDMT);
	var locationEaJavaApi = WSH_SHELL.ExpandEnvironmentStrings("%EA_JAVA_API%");
	LOGInfo("EA_JAVA_API: " + locationEaJavaApi);
	LOGInfo("JAVA_HOME: " + WSH_SHELL.ExpandEnvironmentStrings("%JAVA_HOME%"));
	LOGInfo("JAVACMD: " + WSH_SHELL.ExpandEnvironmentStrings("%JAVACMD%"));
	if ("%EAMT_HOME%" == locationDMT) {
		LOGError("Environment variable EAMT_HOME not set, set this environment variable and restart Enterprise Architect");
		throw new Error("Environment variable EAMT_HOME not set, set this environment variable and restart Enterprise Architect. See also the installation instructions of the EA Modelling Tools Java.");
	}
	if ("%EA_JAVA_API%" == locationEaJavaApi) {
		LOGError("Environment variable EA_JAVA_API not set, set this environment variable and restart Enterprise Architect");
		throw new Error("Environment variable EA_JAVA_API not set, set this environment variable and restart Enterprise Architect. See also the installation instructions of the EA Modelling Tools Java.");
	}
}

/*
 * Method does not work, but keep code here to document what has been tried.
 */
// function determineProcessIdDoesNotWork(workingDirectory) {
	// var processId;
	// var locator = new COMObject("WbemScripting.SWbemLocator"); // see https://docs.microsoft.com/en-us/windows/win32/wmisdk/swbemlocator
	// var service = locator.ConnectServer(".", "\\root\\cimv2");
	// var query = "SELECT * FROM Win32_Process WHERE Name = 'EA.exe'"; // see https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process
	// var processes = service.ExecQuery(query); // ExecQuery() returns an SWbemObjectSet, see https://docs.microsoft.com/en-us/windows/win32/wmisdk/swbemobjectset
	// Session.Output("count=" + processes.Count);
	// /*
	 // * And now how to iterate over processes? Far from trivial using JavaScript.
	 // * See https://dentrassi.de/2011/02/04/access-to-wmi-in-java-using-eclipse-swt-ole-integration/
	 // * and https://stackoverflow.com/questions/20386875/iterating-over-swbempropertyset-objects
	 // * and https://theroadtodelphi.com/2010/12/01/accesing-the-wmi-from-pascal-code-delphi-oxygene-freepascal/
	 // * for some inspiration (but no working solution found yet for Javascript).
	 // * 
	 // * Tried the for/of loop, but "processes is not iterable".
	 // */
	// return processId;
// }
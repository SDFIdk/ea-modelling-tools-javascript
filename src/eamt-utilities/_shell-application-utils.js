/**
 * @file This file contains utility functions to access to aspects of the Windows Explorer Shell application,
 *       such as managing windows, files and folders, and the current session. This is useful in scripts that call
 *       command line scripts importing or exporting models.
 */
 !INC eamt-utilities._logging-utils

/** 
 * Provides access to aspects of the Windows Explorer Shell application, such as managing windows, files and
 * folders, and the current session (from "Windows Powershell Pocket References" by Lee Holmes).
 *
 * See more on [Scriptable Shell Objects](https://docs.microsoft.com/en-us/windows/win32/shell/scriptable-shell-objects-roadmap)
 * (in the Shell Developer's Guide) and
 * [Shell object](https://docs.microsoft.com/en-us/windows/win32/shell/shell) (in the Shell Reference).
 */
var SHELL_APP = new COMObject("Shell.Application");

/**
 * Shows a dialog box (not in the foreground unfortunately...) to the user to choose a folder.
 * Returns the absolute file path of the choosen folder, or an empty string if no folder was selected.
 */
function chooseFolderWithUI(dialogBoxTitle /* : String */) {
	LOGInfo("Pick a folder with the UI (see new dialog)");
	
	/* 
	 * BrowserForFolder method: see https://docs.microsoft.com/en-us/windows/win32/shell/shell-browseforfolder
	 *
	 * 4th argument of BrowseForFolder method:
	 * see https://docs.microsoft.com/en-us/windows/win32/api/shldisp/ne-shldisp-shellspecialfolderconstants:
	 * 0x11 (17). My Computer—the virtual folder that contains everything on the local computer: storage devices, printers, and Control Panel. 
	 * This folder can also contain mapped network drives.
	 */
	var folder = SHELL_APP.BrowseForFolder(0, dialogBoxTitle, 0x00000040, 0x11);
	if (folder == null) {
		return "";
	} else {
		return folder.Self.Path;
	}
}

/**
 * Opens the folder with the given path in Windows Explorer.
 */
function openFolderInWindowsExplorer(folderPath) {
	SHELL_APP.Explore(folderPath);
}
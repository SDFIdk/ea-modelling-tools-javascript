!INC eamt-utilities._command-line-utils

/**
 * Retrieves the [Windows process id](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/finding-the-process-id) 
 * of the EA instance from which this script is invoked. That process id can be used as an argument to one of the applications
 * in the EAMT Modelling Tools Java.
 *
 * @summary Retrieves the Windows process id of this EA instance.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	Session.Output(determineProcessId());
}

main();
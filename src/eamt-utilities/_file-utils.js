/**
 * Opens a dialog to open a CSV file.
 *
 * See also documentation of Project Class, method GetFileNameDialog.
 */
function openCSVFileDialog() {
	var filename, filterString, filterindex, flags, initialDirectory, openOrSave, filepath;

	filename = "";
	filterString = "CSV Files (*.csv)|*.csv|All Files (*.*)|*.*||";
	filterindex = 1;
	flags = 0x2; //OFN_OVERWRITEPROMPT
	initialDirectory = "";
	openOrSave = 0;

	filepath = Repository.GetProjectInterface().GetFileNameDialog(filename, filterString, filterindex, flags, initialDirectory, openOrSave);
	return filepath;
}
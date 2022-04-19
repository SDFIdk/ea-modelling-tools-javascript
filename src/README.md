# Script Documentation

## eamt-data-model-creation

Scripts that assist in creating a logical data model in UML. Scripts that prepare the derivation of physical data schemas are not included here.

### move-grunddata1-to-grunddata2


⚠️ missing description



## eamt-utilities

Utility functions.









## eamt-fda-concept-model-creation

Scripts specific for creating concept models modelled using the FDA profile, see also https://arkitektur.digst.dk/metoder/regler-begrebs-og-datamodellering and https://github.com/digst/model-rules-tool-support.

### synchronize-profile

Synchronizes the tagged values of the Concept and ConceptModel stereotypes of the FDA profile

Synchronizes the tagged values of the Concept and ConceptModel stereotypes of the FDA profile using the
[`Repository.SynchProfile()` method](https://www.sparxsystems.com/search/sphider/search.php?query=synchprofile&type=and&category=User+Guide+Latest&tab=5&search=1).




## eamt-script-management

Scripts used for keeping scripts developed in EA under version control.

### export-scripts


Exports the scripts in one or more scripts groups as

1. a EA reference data file for import in another EA instance 
2. seperate script files
3. a separate README.md file, containing the documentation extracted from the scripts

An asterisk (*) in a regex must be escaped with a backslash, see also Java class
`dk.gov.data.modellingtools.app.ExportScripts`.

So use `xyz\*` instead of `xyz*` to export all script groups that have a name starting with xyz.

The name/regex is used in a LIKE expression in the database of the .eapx file.
See [The LIKE operator in Microsoft Jet SQL](https://docs.microsoft.com/en-us/previous-versions/office/developer/office2000/aa140015(v=office.10)#the-like-operator)
and below for the syntax.

 - asterisk (`*`): matches any number of characters and can be used anywhere in the pattern string.
 - question mark (`?`) matches any single character and can be used anywhere in the pattern string.
 - number sign (`#`): matches any single digit and can be used anywhere in the pattern string.
 - square brackets (`[]`): matches any single character within the list that is enclosed within brackets, and can be used anywhere in the pattern string.
 - exclamation mark (`!`): matches any single character not in the list that is enclosed within the square brackets.
 - hyphen (`-`): matches any one of a range of characters that is enclosed within the square brackets.



### export-eamt-scripts

Exports the EAMT scripts

Exports the scripts in the EAMT scripts groups as

1. a EA reference data file for import in another EA instance 
2. seperate script files
3. a separate README.md file, containing the documentation extracted from the scripts

The scripts should be saved in folder `ea-modelling-tools-javascript/src`.



## eamt-developer-tools

Tools for persons that contribute to the development of the EAMT scripts.

### retrieve-process-id-of-running-ea-instance

Retrieves the Windows process id of this EA instance.

Retrieves the [Windows process id](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/finding-the-process-id) 
of the EA instance from which this script is invoked. That process id can be used as an argument to one of the applications
in the EAMT Modelling Tools Java.



## eamt-data-schema-preparation

Scripts that assist in preparing the derivation of physical data schemas, e.g. using [ShapeChange](https://shapechange.net/).

### transliterate-names

Transliterates the names of the model elements.

Transliterates the Danish characters and the letter e with acute to 
[Basic Latin](https://unicode-table.com/en/blocks/basic-latin/) characters
for all model elements, and puts the transliterated name in tagged value
`transliteratedName`. Enumeration literals are not transliterated, and if
an enumeration literal has that tagged value, it is removed.

- ø → oe
- æ → ae
- å → aa
- é → e



## eamt-data-model-export

Scripts that assist in exporting a logical data model.

### export-data-model-vocabulary-da

Exports a data model to a data vocabulary.

Exports a data model to a Danish data vocabulary in the CSV format.
The package containing the concept model must be selected in the Project Browser.
If a URL is available for the dataset that is described by the data model, it can be provided and will be added to the data model.

This script uses template vocabulary_csv.ftl in %EAMT_HOME%/config/templates.



## eamt-fda-concept-model-export



### export-concept-model

Exports a concept model.

Exports a concept model to a specific format. The package containing the concept model must be selected in the Project Browser.

This script uses templates concept_model_rdf.ftlx and concept_model_asciidoc.ftl in %EAMT_HOME%/config/templates.



## eamt-data-model-validation



### version-status-modified


⚠️ missing description



### stereotype


⚠️ missing description




# Script Documentation

## eamt-data-model-creation

Scripts that assist in creating a logical data model in UML. Scripts preparing the derivation of physical data schemas are **not** included here.

### change-tagged-value-from-single-line-to-multi-line

Converts single-line tagged values to multi-line tagged values.

Converts single-line tagged values with the given name to multi-line tagged values.
Multi-line tagged values are also known as "memo" tagged values.

This can be useful when custom tagged values, not defined in a UML profile, have been added to 
model elements, and it becomes clear that they can contain a large amount of text
and/or line breaks and new lines.



### fix-grunddata-dkdomaenemodel-stereotype

Sets the stereotype of a model to Grunddata::DKDomænemodel.

Certain older models were given stereotype Grunddata::DKDomænemodel, but for some
reason (a bug or shortcoming in older EA versions?), the fully-qualified stereotype was not saved
in the XMI-file.

For newer models with stereotype Grunddata::DKDomænemodel, the XMI 1.1 file in SVN will contain
a tagged value with name $ea_xref_property and a value that contains FQName=Grunddata::DKDomænemodel,
for example:

```xml
<!-- … -->
<UML:TaggedValue tag="stereotype" value="DKDomænemodel"/>
<!-- … -->
<UML:TaggedValue tag="$ea_xref_property" value="…Name=DKDomænemodel;FQName=Grunddata::DKDomænemodel…"/>
<!-- … -->
```

For older models, the tagged value with name $ea_xref_property is not present. This gives issues
when loading the model when the MDG containing the Grunddata2::DKDomænemodel stereotype is loaded, as
EA then possibly assumes that the stereotype of the model is Grunddata2::DKDomænemodel, not 
Grunddata::DKDomænemodel. You can see that this is the case when the stereotype in the docked
[Properties **Window**](https://sparxsystems.com/eahelp/proptab.html)
is shown as Grunddata2::DKDomænemodel, whereas the 
[Properties **Dialog**](https://sparxsystems.com/eahelp/objectproperties.html)
contains a tab "Grunddata", showing the tags defined for stereotype Grunddata::DKDomænemodel.

This script sets the fully-qualified stereotype of the selected package to Grunddata::DKDomænemodel directly
in the EA project file. The package does not have to be checked out to be able to do this. This can be sufficient
when you only want to export the model in a certain format.

Note: you need to select another package and then the updated package again
to see the change in the Properties Window.

To set the correct fully-qualified stereotype in the XMI file as well, 

1. make sure all the package's dependencies are present in the EA project file;
2. check out the package;
3. run this script;
4. check in the package again.



### link-the-type-on-attributes-to-a-type-in-the-model

Change attribute type to classifier reference.

Makes sure that the types of the attributes are actually 
present as classifiers in the model.



### move-grunddata1-to-grunddata2

Upgrade a model from the UML profile of "Modelregler for Grunddata version 1" to the UML profile of "Modelregler for Grunddata version 2".

Update a model to use the UML profile for basic data (grunddata) version 2 
instead of the UML profile for basic data version 1. This includes:

- updating the stereotypes;
- copying the values of the tagged values, when possible;
- updating the definitions to start with a lower case character and to end without a full stop;
- creating classification models from enumeration, if wanted;
- updating the diagram types.

Prerequisite: The following MDGs must be installed and enabled:
- MDG with id GD2MDG (for Basic Data v2) in file Grunddata2MDG.xml;
- MDG with id Grunddata (for Basic Data v1) in file GrunddataMDG.xml;
- MDG with id Geodata (for Basic Data v1) in file Geodata MDG.xml.

MDG's are located in %APPDATA%\Sparx Systems\EA\MDGTechnologies;
the id of an MDG is found with the following XPath expression: /MDG.Technology/Documentation/



### remove-tagged-value

Remove a tagged value from the model.

Removes all tagged values, with the name given via user input, from all classifiers
used in data modelling, and from their properties, 
in the selected package and subpackages.



### update-version-author-status

Updates the version, author and status.

Updates the version, author and status on all elements in this package and subpackages.

If the package has stereotype Grunddata::DKDomænemodel, the tagged value version is updated.

If the package has stereotype Grunddata2::DKDomænemodel, 
the tagged values versionInfo and responsibleEntity are updated.

Packages with other stereotypes are not supported.



## eamt-data-model-import-export

Scripts that assist in importing and exporting a logical data model.

Certain scripts import or export CSV files. CSV files can be opened, edited and exported using an application capable of dealing with spreadsheets, such as LibreOffice Calc or Microsoft Excel. Use "UTF-8" as character set and a comma (",") as separator. For more information, see

- https://help.libreoffice.org/latest/en-US/text/scalc/guide/csv_files.html?&amp;DbPAR=CALC&amp;System=WIN
- https://help.libreoffice.org/latest/en-US/text/shared/00/00000208.html?&amp;DbPAR=SHARED&amp;System=WIN
- https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba

Warning: Never change the contents of column GUID, as this information is required to link a row in the CSV file to the corresponding UML model element.

Tip: Convert a set of CSV files to one spreadsheet when the data has to be edited by someone else. When the editing is finished, the spreadsheets are converted again to a set of CSV files and imported into EA. The conversion can be done manually, via your spreadsheet application GUI. Another option is to convert the files programmatically, for example by using [ogr2ogr](https://gdal.org/programs/ogr2ogr.html).

```bat
ogr2ogr -f ODS -nln Classifiers -oo HEADERS=YES documentation.ods "Model_Elements.csv"
ogr2ogr -update -f ODS -nln Attributes -oo HEADERS=YES documentation.ods "Model_Attributes.csv"
ogr2ogr -update -f ODS -nln AssociationEnds -oo HEADERS=YES documentation.ods "Model_Associationends.csv"
ogr2ogr -update -f ODS -nln EnumerationLiterals -oo HEADERS=YES documentation.ods "Model_EnumerationLiterals.csv"
```

### export-data-model-vocabulary-da

Exports a data model to a data vocabulary.

Exports a data model to a Danish data vocabulary in the CSV format.
The package containing the concept model must be selected in the Project Browser.
If a URL is available for the dataset that is described by the data model, it can be provided and will be added to the data model.

This script uses template vocabulary_csv.ftl in %EAMT_HOME%/config/templates.



## eamt-data-model-validation

Validation scripts to validate the model against for instance the basic data model rules version 2. 



### validate-model-basic-data2


Validates a model model against the 
[basic data model rules version 2](http://grunddatamodel.datafordeler.dk/modelregler/grunddatamodelregler.html).



### validate-model-profile-basic-data2


Validates any model against the
[basic data model rules version 2](http://grunddatamodel.datafordeler.dk/modelregler/grunddatamodelregler.html)
for a specific profile.



### validate-model-simple


Validates any model against the simplest rules for modelling in SDFI.



### validate-sequence-numbers

Validates sequence numbers.

Validates all of the following:

1. A tagged value sequenceNumber is set on the ends of outgoing associations of classifiers having more than one outgoing association;
2. A classifier has no properties with the same sequenceNumber.

ShapeChange ensures that in a case where sequence numbers are not explicitly set,
attributes are placed in front of association roles by giving attributes a sufficiently
low sequence number. Therefore, it is sufficient to have sequence numbers on associations ends only,
attributes do not need sequence numbers (but may have sequence numbers).



## eamt-data-schema-preparation

Scripts that assist in preparing the derivation of physical data schemas, e.g. using [ShapeChange](https://shapechange.net/).

### set-database-names

Adds tagged values with database name.

Adds tagged value "dbName" containing the name to be used in the database 
for all relevant model elements (not on enumeration values).

The database name is set using the following logic: 

```mermaid
flowchart LR
    %% decisions
    oracleNameSet{"Is tagged value<br />oracleName set?"}
    transliteratedNameSet{Is tagged value<br />transliteratedName set?}
    %% outcomes
    useOracleName[Use the value of tagged value oracleName as value of tagged value dbName]
    usetransliteratedName[Use tagged value transliteratedName as value of tagged value dbName]
    useModelElementName[Use model element name as value of tagged value dbName]
    %% arrows
    Start --> oracleNameSet
    oracleNameSet --> | yes | useOracleName --> End
    oracleNameSet --> | no | transliteratedNameSet
    transliteratedNameSet --> | yes | usetransliteratedName --> End
    transliteratedNameSet --> | no | useModelElementName --> End
 ```

A special mapping is done for the following attributes:

- geometry → geometri
- beginLifespanVersion → registreringFra
- endLifespanVersion → registreringTil



### set-gml-names

Adds tagged values with a GML name.

Adds tagged value "gmlName" containing the name to be used in the 
GML application schema for all relevant model elements (not on enumeration values).

The GML name is set using the following logic: 

```mermaid
flowchart LR
    %% decisions
    gisNameSet{"Is tagged value<br />gisName set?"}
    transliteratedNameSet{Is tagged value<br />transliteratedName set?}
    %% outcomes
    useGisName[Use tagged value gisName as value of tagged value gmlName]
    usetransliteratedName[Use tagged value transliteratedName as value of tagged value gmlName]
    useModelElementName[Use model element name as value of tagged value gmlName]
    %% arrows
    Start --> gisNameSet
    gisNameSet --> | yes | useGisName --> End
    gisNameSet --> | no | transliteratedNameSet
    transliteratedNameSet --> | yes | usetransliteratedName --> End
    transliteratedNameSet --> | no | useModelElementName --> End
 ```

Setting a GML name is useful when dealing with feature collections, 
where the GDAL/OGR [GML driver](https://gdal.org/drivers/vector/gml.html)
expects the property name for the feature collection member to end on "member" or "members".

By using those kinds of property names, at least support for GML in QGIS is better and thus more user-friendly.
See e.g. https://github.com/inspire-eu-validation/ets-repository/issues/142.

An example:

```mermaid
classDiagram
    class MyFeatureCollection {
        …
    }
    class MyFeature {
        …
    }
    MyFeatureCollection o--> "myFeature 0..*" MyFeature
```


When 

1. setting tagged value gisName = myFeatureMember for property myFeature
2. using this script
3. configuring ShapeChange to use the value of gmlName when present

the GML application schema below is obtained.

```xml
 <!-- … -->
<element name="MyFeatureCollection" substitutionGroup="gml:AbstractFeature" type="ex:MyFeatureCollectionType">
</element>
<complexType name="MyFeatureCollectionType">
    <complexContent>
        <extension base="gml:AbstractFeatureType">
            <sequence>
                <!-- … -->
                <element maxOccurs="unbounded" minOccurs="0" name="myFeatureMember">
                    <complexType>
                        <complexContent>
                            <extension base="gml:AbstractFeatureMemberType">
                                <sequence>
                                    <element ref="ex:MyFeature"/>
                                </sequence>
                            </extension>
                        </complexContent>
                    </complexType>
                </element>
                <!-- … -->
            </sequence>
        </extension>
    </complexContent>
</complexType>
<!-- … -->
```

A GML document specifying a feature collection of type `MyFeatureCollection`,
containing features of type `MyFeature`, will be recognized by
the GDAL/OGR [GML driver](https://gdal.org/drivers/vector/gml.html)
as having a layer called `MyFeature`, and its features can be visualized in QGIS 
without doing any modifications or transformations.

For more information about GML feature collections, see section 9.9 in the
[GML 3.2.2 specification](https://portal.opengeospatial.org/files/?artifact_id=74183&version=2).



### set-size-attribute-with-enumeration-type

Sets the size tag of attributes based on the referenced enumeration.

Adds a tagged value "size" to attributes. The value is based on the 
length of the enumeration literals 
of the enumeration that is the attribute's type.

You can choose whether to calculate the length in bytes (for Oracle) or
in characters (for Oracle and PostgreSQL).

Note that the size of characters in a database depends on the character set of 
the database. This script can be used for an Oracle database with 
character set AL32UTF8.

See https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/
and https://docs.oracle.com/search/?q=al32utf8.



### set-transliterated-names

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



## eamt-developer-tools

Tools for persons that contribute to the development of the EAMT scripts.

### retrieve-process-id-of-running-ea-instance

Retrieves the Windows process id of this EA instance.

Retrieves the [Windows process id](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/finding-the-process-id) 
of the EA instance from which this script is invoked. The process id can be used as an argument to one of the applications
in the EAMT Modelling Tools Java.



## eamt-profile-management

Scripts that assist in managing profiles of data models.

### chg-add-new-profile

Adds a new profile to model elements, if not yet present.

Adds a new profile to the package and/or classifier (including the classifier's properties)
selected in the project browser.



### chg-add-profiles-tag

Prepare a model for profiling.

Adds tagged value "profiles" to the package and/or classifier (including the classifier's properties)
selected in the project browser, if that tagged value is not yet present.

The value of tagged value "profiles" is set to an empty string, if the tagged value is not yet present.



### chg-remove-profiles-tag

Remove all information regarding profiles from the model.

Remove tagged value "profiles" from all relevant model elements of the
selected package.



## eamt-script-management

Scripts used for keeping scripts developed in EA under version control.

### export-eamt-scripts

Exports the EAMT scripts

Exports the scripts in the EAMT scripts groups as

1. a EA reference data file for import in another EA instance 
2. seperate script files
3. a separate README.md file, containing the documentation extracted from the scripts

The scripts should be saved in folder `.../ea-modelling-tools-javascript/src`.



### export-scripts


Exports the scripts in one or more scripts groups as

1. a EA reference data file for import in another EA instance 
2. seperate script files
3. a separate README.md file, containing the documentation extracted from the scripts

The name/regex is used in a LIKE expression in the database of EA project file.

For .qea files, see [the LIKE operator in SQLite](https://sqlite.org/lang_expr.html#the_like_glob_regexp_match_and_extract_operators).

For .eapx files, see
[the LIKE operator in Microsoft Jet SQL](https://docs.microsoft.com/en-us/previous-versions/office/developer/office2000/aa140015(v=office.10)#the-like-operator)
Note that an asterisk (*) in a regex must be escaped with a backslash. So use `xyz\*` instead of `xyz*` to export all script groups that have a name starting with xyz.



## eamt-utilities

Scripts containing utility functions, that are used by other scripts.










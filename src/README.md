# Script Documentation

## eamt-data-model-creation

Scripts that assist in creating a logical data model in UML. Scripts that prepare the derivation of physical data schemas are not included here.

### link-the-type-on-attributes-to-a-type-in-the-model

Change attribute types to types in model

Makes sure that the types of the attributes are actually elements
present in the model.



### move-grunddata1-to-grunddata2

Upgrade a model from model rules	"modelregler for Grunddata version 1.2" 
						  to model rules	"modelregler for Grunddata version 2.0"

Change the stereotypes on package's, element's, attributes and roles from Grundata 1.2 uml-profile to the Grunddata 2.0 uml-profile.
Copies data for Grundata 1.2 tags to Grunddata 2.0 when posible
Creates Classificationmodels from Enumerations
Diagrams are updated to to Grunddata version 2.0 MDG
Definitions and Description are updated to follow Grunddata 2.0  e.g. start with lowerCase and end without full stop

Requirement : Grunddata2MDG.xml needs to be installed for the script to work.

Not all mandatory Grunddata 2.0 tags can be filled out from Grunddata 1.2 tags, so for a model to be Grunddata 2.0 compliant further Grunddata 2.0 tags needs to be set.



### remove-tagged-value

Remove tagged value from the model

Removes all tagged values with the name given via user input, from all elements
of type Class, DataType and Enumeration, and their properties 
in the selected package and its subpackages.



### update-version-author-status

Updates the version, author and status

Updates the version, author and status on all elements in this package and its subpackages.

If the package has stereotype Grunddata::DKDomænemodel, the tagged value version is updated.

If the package has stereotype Grunddata2::DKDomænemodel, 
the tagged values versionInfo and responsibleEntity are updated.

Packages with other stereotypes are not supported.



## eamt-data-model-import-export

Scripts that assist in importing and exporting a logical data model.

### export-data-model-vocabulary-da

Exports a data model to a data vocabulary.

Exports a data model to a Danish data vocabulary in the CSV format.
The package containing the concept model must be selected in the Project Browser.
If a URL is available for the dataset that is described by the data model, it can be provided and will be added to the data model.

This script uses template vocabulary_csv.ftl in %EAMT_HOME%/config/templates.



## eamt-data-schema-preparation

Scripts that assist in preparing the derivation of physical data schemas, e.g. using [ShapeChange](https://shapechange.net/).

### set-database-names

Adds tagged values with database name

Adds tagged value "dbName" containing the name to be used in the database 
for all relevant model elements (not on enumeration values).

The database name is set using the following logic: 

```mermaid
flowchart LR
    %% decisions
    oracleNameSet{"Is tagged value<br />oracleName set?"}
    transliteratedNameSet{Is tagged value<br />transliteratedName set?}
    %% outcomes
    useOracleName[Use tagged value oracleName]
    usetransliteratedName[Use tagged value transliteratedName]
    useModelElementName[Use model element name]
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

Adds tagged values with a GML name

Adds tagged value "gmlName" containing the name to be used in the 
GML application schema for all relevant model elements (not on enumeration values).

The GML name is set using the following logic: 

```mermaid
flowchart LR
    %% decisions
    gisNameSet{"Is tagged value<br />gisName set?"}
    transliteratedNameSet{Is tagged value<br />transliteratedName set?}
    %% outcomes
    useGisName[Use tagged value gisName]
    usetransliteratedName[Use tagged value transliteratedName]
    useModelElementName[Use model element name]
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

By using those kinds of property names, at least support for GML in GIS is better and thus more user-friendly.
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
containing features of type `MyFeature` in it, will then be recognized by
the GDAL/OGR [GML driver](https://gdal.org/drivers/vector/gml.html)
as having a layer called `MyFeature`, and its features can be visualized in QGIS 
without doing any modifications or transformation.

For more information about GML feature collections, see section 9.9 in the
[GML 3.2.2 specification](https://portal.opengeospatial.org/files/?artifact_id=74183&version=2).



### set-size-attribute-with-enumeration-type

Sets the size tag of attributes based on their enumeration

Sets the size tag of attributes based on the length of the enumeration literals 
of the enumeration that is the attributes' type.

You can choose whether to calculate the length in bytes (for Oracle) or
in characters.

Note that the size of characters in a database depends on the character set of 
the database. This scripts can be used for an Oracle database with 
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
of the EA instance from which this script is invoked. That process id can be used as an argument to one of the applications
in the EAMT Modelling Tools Java.



## eamt-fda-concept-model-creation

Scripts specific for creating concept models modelled using the FDA profile, see also https://arkitektur.digst.dk/metoder/regler-begrebs-og-datamodellering and https://github.com/digst/model-rules-tool-support.


### synchronize-profile

Synchronizes the tagged values of the Concept and ConceptModel stereotypes of the FDA profile

Synchronizes the tagged values of the Concept and ConceptModel stereotypes of the FDA profile using the
[`Repository.SynchProfile()` method](https://www.sparxsystems.com/search/sphider/search.php?query=synchprofile&type=and&category=User+Guide+Latest&tab=5&search=1).



### update-version-author-status

Updates the version, author and status

Updates the version, author and status on all elements in this package and its subpackages.
The tagged values versionInfo and responsibleEntity are updated as well.

Packages with other stereotypes than FDAprofil::ConceptModel are not supported.



## eamt-fda-concept-model-export



### export-concept-model

Exports a concept model.

Exports a concept model to a specific format. The package containing the concept model must be selected in the Project Browser.

This script uses templates concept_model_rdf.ftlx and concept_model_asciidoc.ftl in %EAMT_HOME%/config/templates.



## eamt-profile-management

Scripts that assist in managing profiles of data models.

### chg-add-new-profile

Adds a new profile to model elements, if not yet present.

Adds a new profile to either all relevant elements and their properties in the selected package
or to the selected element and its properties.



### chg-add-profiles-tag

Prepare a model for profiling.

Add tagged value "profiles" to either all relevant elements and their properties in the selected package
or to the selected element and its properties, if that tagged value is not yet present.

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

The scripts should be saved in folder `ea-modelling-tools-javascript/src`.



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

Utility functions.









## eamt-val-data-model-validation

Validation scripts to validate the model against for instance the basic data model rules version 2. 

### validate-model-basic-data2

Validate a model against the basic data model rules version 2.

Script to validate any model against the basic data model rules version 2 
(http://grunddatamodel.datafordeler.dk/modelregler/grunddatamodelregler.html).

Select a model in the Project Browser and run this script in order to validate it.



### validate-model-profile-basic-data2

Validate a model against the basic data model rules version 2.

Script to validate any model against the basic data model rules version 2 for specific profile
(http://grunddatamodel.datafordeler.dk/modelregler/grunddatamodelregler.html).

Select a model in the Project Browser, edit the profile in the script and run this script in order to validate model.



### validate-model-simple

Validate a model against the simplest rules.

Script to validate any model against the simplest rules for modelling in SDFI 

Select a model in the Project Browser and run this script in order to validate it.






!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils
!INC eamt-val-data-model-validation.validation-scripts-basic-data2

/**
 * Script to validate any model against the simplest rules for modelling in SDFI 
 * 
 * Select a model in the Project Browser and run this script in order to validate it.
 *
 * @summary Validate a model against the simplest rules.
 */
function main() {
	
	Repository.EnsureOutputVisible("Script");
	var selectedPackage as EA.Package;	
	var now = new Date();
	selectedPackage = Repository.GetTreeSelectedPackage();
	var elements = getElementsOfPackageAndSubpackages(selectedPackage);	
	
	// set log level to error (0) as the output should only contain the validation report, no log messages
	LOGLEVEL = -1;
	
	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		Session.Output(" ");
		Session.Output("Dette er valideringsrapporten for modellen '" + selectedPackage.Name + "' udarbejdet af Modelsekretariatet d. " + now.getDate() + "/" + (now.getMonth() + 1) + " " + now.getFullYear() + ".");
		Session.Output(" ");
		Session.Output("OBS: Dette script validerer KUN for modeller lavet på MDG'en Grunddata2!");
		Session.Output("________________________________________________________________________________________________________________")

		Session.Output(" ");
		Session.Output("Tjek af, at der kun bruges udvalgte UML-elementer (jf. regel 4.2)");
		umlElementer(elements);
		
		Session.Output(" ");
		Session.Output("Tjek af, at der kun bruges UML-stereotyper (jf. regel 4.3)");
		stereotypes(selectedPackage,elements);
		
		Session.Output(" ");
		Session.Output("Tjek af, at der er udfyldt navn og beskrivelse af modellen (jf. regel 4.4)");
		Session.Output("Tags \"title (da)\" og \"description (da)\": ");
		modeltags1(selectedPackage);
		Session.Output("Beskrivelse og titel bør kontrolleres manuelt for at sikre meningsfyldt indhold.");

		Session.Output(" ");
		Session.Output("Tjek af, at der er angivet korrekt formateret modelversion (jf. regel 4.8)");
		modeltags5(selectedPackage);

		Session.Output(" ");
		Session.Output("Tjek af, at der er angivet tilladt værdi for modelstatus (jf. regel 4.10)");	
		modeltags7(selectedPackage);

		/*Session.Output(" ");
		Session.Output("Tjek af, at elementers tag \"prefLabel (da)\" er udfyldt (jf. regel 5.3)");
		prefLabel(elements);
		Session.Output("Elementernes 'prefLabel (da)' bør tjekkes manuelt for at sikre meningsfyldt indhold.");
*/
		Session.Output(" ");
		Session.Output("Tjek af, at der er angivet korrekt formateret elementnavne (jf. regel 5.4)");
		checkCamel(elements);
		Session.Output("(bemærk; stort startbogstaver i attribut- og connectornavn er i enkelte tilfælde tilladt, fx ved forkortelser såsom CVR eller DAGI.)");
				
		Session.Output(" ");
		Session.Output("Tjek af, at der er angivet korrekt formateret elementdefinitioner (jf. regel 5.5)");
		checkDef(elements);

		Session.Output(" ");
		Session.Output("Tjek af, at der er benyttet de standardiserede primitive datatyper (jf. regel 5.9)");
		ISOtype(elements);
		Session.Output("(bemærk; hvis der er fejl her, kør da evt. scriptet \"link-the-type-on-attributes-to-a-type-in-the-model\")");
		
		Session.Output(" ");
		Session.Output("Tjek af, at der er udfyldt tagget \"historikmodel\" for objekttyperne (jf. regel 5.10)");
		historik(elements);
		
		Session.Output(" ");
		Session.Output("Tjek af, at der er angivet en attribut med navn \"id\" (jf. regel 6.1)");
		checkID(elements);
		Session.Output("(bemærk; for nogle modeller er en id ikke obligatorisk.)"); /*virkelig? skal den her så med?*/
		
		Session.Output(" ");
		Session.Output("Tjek af, at der er angivet attributter med navn \"registreringFra\" og \"registreringTil\" (jf. regel 6.2)");
		checkReg(elements);
		
		Session.Output(" ");
		Session.Output("Tjek af, at der er angivet attributter med navn \"virkningFra\" og \"virkningTil\", såfremt det er angivet i \"historikmodel\" (jf. regel 6.3)");
		countHistorikmodel(elements);
		checkVirk(elements);
		historikReg(elements);

		Session.Output(" ");
		Session.Output("***** Rapport afsluttet " + _LOGGetDisplayDate() +" *****");
	}
	else {
	LOGInfo(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils
!INC eamt-data-model-validation._validation-functions-basic-data2

/**
 * Validates a model model against the 
 * [basic data model rules version 2](http://grunddatamodel.datafordeler.dk/modelregler/grunddatamodelregler.html).
 */
function main() {
	
	Repository.EnsureOutputVisible("Script");
	var selectedPackage as EA.Package;	
	var now = new Date();
	selectedPackage = Repository.GetTreeSelectedPackage();
	var elements = getElementsOfPackageAndSubpackages(selectedPackage);	
	
	// set log level to error as the output should only contain the validation report, no log messages
	LOGLEVEL = -1;
	
	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		Session.Output(" ");
		Session.Output("Dette er valideringsrapporten for modellen '" + selectedPackage.Name + "' udarbejdet af Modelsekretariatet d. " + now.getDate() + "/" + (now.getMonth() + 1) + " " + now.getFullYear() + ".");
		Session.Output(" ");
		Session.Output("OBS: Dette script validerer KUN for modeller lavet på MDG'en Grunddata2!");
		Session.Output("________________________________________________________________________________________________________________")
		
		Session.Output(" ");
		Session.Output("Regel 4.1: Brug UML som det visuelle modelsprog");
		Session.Output("Denne regel tjekkes manuelt.");

		Session.Output(" ");
		Session.Output("Regel 4.2: Brug kun udvalgte UML-elementer");
		umlElementer(elements);
		
		Session.Output(" ");
		Session.Output("Regel 4.3: Brug UML-stereotyper");
		stereotypes(selectedPackage,elements);
		
		Session.Output(" ");
		Session.Output("Regel 4.4: Angiv meningsfyldte navne og beskrivelser for modellen");		
		Session.Output("title (da) og description (da): ");
		modeltags1(selectedPackage);
		Session.Output("language og modelScope: ");
		modeltags1_2(selectedPackage);
		Session.Output("Beskrivelser og titler bør kontrolleres manuelt for at sikre meningsfyldt indhold.");
		
		Session.Output(" ");
		Session.Output("Regel 4.5: Angiv identifikation af modeller");
		modeltags2(selectedPackage);
	
		Session.Output(" ");
		Session.Output("Regel 4.6: Angiv den modelansvarlige organisation");
		modeltags3(selectedPackage);
	
		Session.Output(" ");
		Session.Output("Regel 4.7: Angiv emneområde for modellen");
		modeltags4(selectedPackage);
	
		Session.Output(" ");
		Session.Output("Regel 4.8: Angiv modellens version");
		modeltags5(selectedPackage);
	
		Session.Output(" ");
		Session.Output("Regel 4.9: Modellen skal godkendes");
		modeltags6(selectedPackage);
		Session.Output("Efter endt kontrol og konformanstjek bør modellens status tilrettes.");
	
		Session.Output(" ");
		Session.Output("Regel 4.10: Angiv modellens modelstatus");	
		modeltags7(selectedPackage);
	
		Session.Output(" ");
		Session.Output("Regel 4.11: Angiv modellens lovgrundlag og kilde");
		modeltags8(selectedPackage);
		Session.Output("Modellens 'legalSource' bør tjekkes manuelt for at sikre meningsfyldt indhold.");
		
		Session.Output(" ");
		Session.Output("Regel 4.12: Modeller klassifikationer til genbrug");
		Session.Output("Denne regel tjekkes manuelt.");

		Session.Output(" ");
		Session.Output("Regel 4.13: God diagrammeringsskik");
		Session.Output("Denne regel tjekkes manuelt.");
		
		Session.Output(" ");
		Session.Output("Regel 5.1: Angiv meningsfyldte UML-navne for modelelementer");
		Session.Output("Denne regel tjekkes manuelt.");
		
		Session.Output(" ");
		Session.Output("Regel 5.2: Giv alle modelelementer en identifikator");
		identifikator(elements);
		Session.Output("Elementernes 'URI' bør tjekkes manuelt for at sikre meningsfyldt indhold.");
		
		Session.Output(" ");
		Session.Output("Regel 5.3: Angiv termer i et naturligt sprog");
		prefLabel(elements);
		Session.Output("Elementernes 'prefLabel (da)' bør tjekkes manuelt for at sikre meningsfyldt indhold.");

		Session.Output(" ");
		Session.Output("Regel 5.4: Brug standardiserede konventioner for angivelse af navne");
		checkCamel(elements);
		
		Session.Output(" ");
		Session.Output("Regel 5.5: Udarbejd definitioner eller beskrivelser af modellens elementer");
		checkDef(elements);
		
		Session.Output(" ");
		Session.Output("Regel 5.6: Udarbejd strukturerede definitioner på en standardiseret måde");
		Session.Output("Denne regel tjekkes manuelt.");
				
		Session.Output(" ");
		Session.Output("Regel 5.7: Udarbejd anvendelsesneutrale definitioner");
		Session.Output("Denne regel tjekkes manuelt.");
		
		Session.Output(" ");
		Session.Output("Regel 5.8: Angiv modelelementers lovgrundlag");
		checkLegal(elements);
		checkSource(elements);
		Session.Output("Elementernes 'legalSource' bør tjekkes manuelt for at sikre meningsfyldt indhold.");
		
		Session.Output(" ");
		Session.Output("Regel 5.9: Brug standardiserede primitive datatyper");
		ISOtype(elements);
		
		Session.Output(" ");
		Session.Output("Regel 5.10: Angiv historikmodel for grunddataobjekttyper");
		historik(elements);
		
		Session.Output(" ");
		Session.Output("Regel 6.1: Alle grunddataobjekttyper skal modelleres med persistent, unik identifikation");
		checkID(elements);
		
		Session.Output(" ");
		Session.Output("Regel 6.2: Alle grunddataobjekttyper skal understøtte registreringstid");
		checkReg(elements);
		
		Session.Output(" ");
		Session.Output("Regel 6.3: Grunddataobjekttyper bør understøtte virkningstid");
		countHistorikmodel(elements);
		checkVirk(elements);
		historikReg(elements);
		
		Session.Output(" ");
		Session.Output("Regel 6.4: Alle grunddataobjekttyper bør modelleres med status");
		Session.Output(checkAttr(elements,"status"));

		Session.Output(" ");
		Session.Output("Regel 6.5: Alle modelentiteter bør understøtte beskedfordeling");
		Session.Output("Forretningshændelse: " + checkAttr(elements,"forretningshændelse"));
		Session.Output("Forretningsproces: " + checkAttr(elements,"forretningsproces"));
		
		Session.Output(" ");
		Session.Output("***** Rapport afsluttet " + _LOGGetDisplayDate() +" *****");
	}
	else {
	LOGInfo(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();
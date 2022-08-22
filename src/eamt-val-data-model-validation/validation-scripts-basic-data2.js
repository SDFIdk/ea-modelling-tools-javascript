/*
 * @file Functions specifically made to test the validity of a model against the model data rules version 2.0.
 */
const upperCamel = ["Class", "Association class", "DataType", "Enumeration"]; 
const lowerCamel = ["Aggregation", "Association", "Role", "Attribute"]; 
const allowedUMLelements = ["Aggregation", "Class", "Generalization", "Association class", 'Association', "Composition", "Role", "Attribute", "DataType", "Enumeration", "Text", "Note", "Notetext", "NoteLink", "Dependency", "Boundary"]; 
const omitUMLelements = ["ProxyConnector","Text", "Note", "Notetext", "NoteLink", "Dependency", "Boundary"];
const allowedstereotypesModel = ["Grunddata2::DKDomænemodel", "Grunddata2::DKKlassifikationsmodel", "DKDomænemodel", "DKKlassifikationsmodel"];
const allowedstereotypesElement = ["Grunddata2::DKObjekttype", "Grunddata2::DKDatatype","Grunddata2::DKEnumeration", "Grunddata2::DKKodeliste"];
const allowedstereotypesAttributeRole = "DKEgenskab";
var elementIDlist = [];

/**
 * Validate if the selected model uses the correct UML model elements following the basic data model rules version 2.
 */
function umlElementer(elements){

	var r = 0;
	var connectorSet = new Set();

	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		//Vi ser lige bort fra de der proxyer.
		if (currentElement.Type != 'ProxyConnector'){
		
			if (allowedUMLelements.includes(currentElement.Type)){
				//do nothing
			} else {
				LOGError("Type not on allowed UML type list");
				Session.Output("Elementet med navn '" + currentElement.Name + "' og type '" + currentElement.Type + "' er ikke en tilladt UML-type");
				r+=1;
			}

				
			//Session.Output("-------------connectors---------------")
			var connectors as EA.Collection;
			connectors = currentElement.Connectors;
			for (var j = 0; j < connectors.Count; j++) {
				var currentConnector as EA.Connector;
				currentConnector = connectors.GetAt(j);
				
				if(connectorSet.has(currentConnector.ConnectorID) == false){
						connectorSet.add(currentConnector.ConnectorID);
	
					if (allowedUMLelements.includes(currentConnector.Type)){
						//do nothing;
					} else {
						LOGError("Type not on allowed UML type list");
						Session.Output("Connectoren med navn '" + currentConnector.Name + "' og type '" + currentConnector.Type + "' er ikke en tilladt UML-type");
						r+=1;
					}
					
					if (currentConnector.Type == 'Association' || currentConnector.Type == 'Aggregation'){
						
						clientEnd = currentConnector.ClientEnd;
						supplierEnd = currentConnector.SupplierEnd;
						
						if (currentConnector.Name == null || currentConnector.Name == ""){
							LOGError("No name on connector associated with element '" + currentElement.Name + "'.");
							Session.Output("Navn på connector tilknyttet elementet '" + currentElement.Name + "' mangler.");
							r+=1;
						}
						
						if (currentConnector.Direction == "Unspecified"){
							LOGError("No direction on '" + currentConnector.Name + "' associated with element '" + currentElement.Name +"'.");
							Session.Output("Retning mangler på connectoren '" + currentConnector.Name + "' tilknyttet elementet '" + currentElement.Name +"'.");
							r+=1;
						}
						
						if ((clientEnd.Role == null || clientEnd.Role == "") && (supplierEnd.Role == null || supplierEnd.Role== "")){
							LOGError("No roles on '" + currentConnector.Name + "' associated with element '" + currentElement.Name +"'.");
							Session.Output("Rolle(r) mangler på connectoren '" + currentConnector.Name + "' tilknyttet elementet '" + currentElement.Name +"'.");
							r+=1;
						}
					
						if (clientEnd.Role){
							if (clientEnd.Cardinality == null || clientEnd.Cardinality == ""){
								LOGError("No multiplicity given for role '" + clientEnd.Role + "' on '" + currentConnector.Name + "' associated with element '" + currentElement.Name +"'.");
								Session.Output("Multiplicitet mangler for rollen '" + clientEnd.Role + "' på connectoren '" + currentConnector.Name + "' tilknyttet elementet '" + currentElement.Name +"'.");
								r+=1;
							}							
						}
						if (supplierEnd.Role){
							if (supplierEnd.Cardinality == null || supplierEnd.Cardinality == ""){
								LOGError("No multiplicity given for role '" + supplierEnd.Role + "' on '" + currentConnector.Name + "' associated with element '" + currentElement.Name +"'.");
								Session.Output("Multiplicitet mangler for rollen '" + supplierEnd.Role + "' på connectoren '" + currentConnector.Name + "' tilknyttet elementet '" + currentElement.Name +"'.");
								r+=1;
							}							
						}
					}
				} 
			}	
			//Session.Output("-------------attributes multiplicitet---------------")

			for (var k=0; k < currentElement.Attributes.Count; k++){

				var attrMultiUpper = currentElement.Attributes.GetAt(k).UpperBound;
				var attrMultiLower = currentElement.Attributes.GetAt(k).LowerBound;

				// No need to test for empty upper and lower bounds, 'cos EA defaults to 1 if no value is put in. Thus I will not be able to catch this error.
				if (attrMultiUpper != "*" && (/\d+/.test(attrMultiLower) == false || /\d+/.test(attrMultiUpper) == false)){
					LOGError("Wrong multiplicity on '" + currentElement.Attributes.GetAt(k).Name + "' associated with element '" + currentElement.Name +"'.");
					Session.Output("Multiplicitet ugyldig på attributten '" + currentElement.Attributes.GetAt(k).Name + "' tilknyttet elementet '" + currentElement.Name +"'.");
					r+=1;
				} 
				else if (attrMultiUpper != "*" && attrMultiUpper < attrMultiLower ){
					LOGError("Multiplicity on '" + currentElement.Attributes.GetAt(k).Name + "' associated with element '" + currentElement.Name +"' is wrong. Upper bound is lower than lower bound.");
					Session.Output("Multiplicitet ugyldig på attributten '" + currentElement.Attributes.GetAt(k).Name + "' tilknyttet elementet '" + currentElement.Name +"'. Ret grænseværdier.");
					r+=1;
				}
			}
		}			
	}
	
	if (r == 0){
		Session.Output("OK");
	}
}

/**
 * Validate if the selected model has stereotype following the basic data model rules version 2.
 */
function stereotypes(selectedPackage,elements){
	
	//Tjek af modellens stereotype
	var j = checkStereotypeModel(selectedPackage);	
	if (j==1){
		LOGInfo("Stereotype on model '"+ selectedPackage.Name + "' OK.");
		Session.Output("Modellens stereotype: OK");
	} else if (j>1){
		LOGError("Too many stereotypes on model '"+ selectedPackage.Name + "'. Only one is allowed.");
		Session.Output("Modellen med navn '" + selectedPackage.Name + "' har for mange stereotyper tilknyttet. Kun 1 er tilladt.");
	} else {
		LOGError("Stereotype on model '"+ selectedPackage.Name + "' not on allowed list or no stereotype given.");
		Session.Output("Modellen med navn '" + selectedPackage.Name + "' har ikke korrekt stereotype.");
	}


	//Tjek af modelelementernes stereotype	
	var q = 0;
	for (var i = 0; i < elements.length; i++) {
		currentElement = elements[i];
		//Hov, hvorfor tjekker jeg kun på de tre typer af elementer?? Nok fordi at stregerne mellem elementerne er af typen ProxyConnector, og de har ikke stereotyper 
		if (currentElement.Type == "Class" || currentElement.Type == "DataType" || currentElement.Type == "Enumeration") {
			var k = checkStereotypeElement(currentElement);
			if (k==1){
				LOGInfo("Stereotype on element '" + currentElement.Name + "' OK.");
				q+=1;
			} else if (k>1){
				LOGError("Too many stereotypes on element '" + currentElement.Name + "'. Only one is allowed.");
				Session.Output("Elementet med navn '" + currentElement.Name + "' har for mange stereotyper tilknyttet. Kun 1 er tilladt.");
			} else {
				LOGError("Stereotype on element '" + currentElement.Name + "' not on allowed list or no stereotype given.");
				Session.Output("Elementet med navn '" + currentElement.Name + "' har ikke korrekt stereotype.");
			}			
		} else if (currentElement.Type == "ProxyConnector"){q += 1;}	
	}

	if (q == elements.length){
		Session.Output("Alle elementers stereotype: OK");
	}
	
	//Tjek af attributternes stereotype, så vi looper igen	
	var o = 0;
	for (var i = 0; i < elements.length; i++) {
		currentElement = elements[i];
		//Hov, hvorfor tjekker jeg kun på de to typer af elementer?? Fordi der kun er attributter på Class og Datatype, ikke Enumeration o.a. (her er det modelelementer, men læses som attributter, så de skal lige sorteres fra)
		if (currentElement.Type == "Class" || currentElement.Type == "DataType") {
			let param = checkStereotypeAttribute(currentElement);
			var antalKorrekteAttributterPrElement = param[0];
			var antalAttributterPrElement = param[1];
			
			if (antalKorrekteAttributterPrElement==antalAttributterPrElement){
				LOGInfo("Stereotype on attributes in element '" + currentElement.Name + "': OK.");
				o += 1;
			} else {
				continue;
			}
		} else {o += 1;}	
	}
	
	if (o == elements.length){
		Session.Output("Alle attributters stereotype: OK");
	}	
	
	//Tjek af rollernes stereotype også
	var b = 0;
	var c = 0;
	var d = 0;
	for (var i = 0; i < elements.length; i++) {
		currentElement = elements[i];
		//ProxyConnectoren er et element for forbindelser mellem element, men forbindelsernes egenskaber og endernes egenskaber ligger på elementerne.
		if (currentElement.Type != "ProxyConnector"){
			//Session.Output("Alle");
			let param = checkStereotypeConnectorEnd(currentElement);
			var korrektClientRollePrElement = param[0];
			var korrektSupplierRollePrElement = param[1];
			var akkLenAfConnectorSet = param[2];
			var stereotypeUdenRolle = param[3];
			
			b = b + korrektClientRollePrElement;
			c = c + korrektSupplierRollePrElement;
			d = d + stereotypeUdenRolle;
		} 		
	}
	//Session.Output("Alle2");
	if (b == c && c == d && d == 0){
		Session.Output("Der findes ingen roller i denne pakke.");
		}
	else if ((b + c) == akkLenAfConnectorSet && d == 0){
		Session.Output("Alle rollers stereotype: OK");
	}		
}

/**
 * Function to check if a given model has an allowed stereotype. A number is returned; if the number is 0 the model has no stereotype
 * if it is 1 the stereotype is correct and if it is higher than 1 the model has too many stereotypes.
 *
 * @param package {EA.Package}
 * @return variable defining whether or not the model has no stereotype (=0), correct stereotype (=1) or too many stereotypes (>1)
 */
function checkStereotypeModel(package){
	// Check if the selected package has the correct stereotype, and only one stereotype
	var j=0;
	for (var i = 0; i < allowedstereotypesModel.length; i++){
		if (package.Element.HasStereotype(allowedstereotypesModel[i])) {
			j+=1;
		} else {
			//do nothing
			continue;
		}
	}
	return j;
}

/**
 * Function to check if a given element has an allowed stereotype. A number is returned; if the number is 0 the element has no stereotype
 * if it is 1 the stereotype is correct and if it is higher than 1 the element has too many stereotypes.
 *
 * @param element {EA.Element}
 * @return variable defining whether or not the element has no stereotype (=0), correct stereotype (=1) or too many stereotypes (>1)
 */
function checkStereotypeElement(element){
	// Check if the elements of the selected package has the correct stereotype, and only one stereotype
	var j=0;
	for (var i = 0; i < allowedstereotypesElement.length; i++){
		if (element.HasStereotype(allowedstereotypesElement[i])) {
			j+=1;
		} else {
			//do nothing
			continue;
		}
	}
	return j;
}

/**
 * Function to check if the attributes of a given element have an allowed stereotype. Two numbers are returned; the number of attributes 
 * with correct stereotypes, and the total count of attributes
 *
 * @param element {EA.Element}
 * @return variables [a,b] depicting the number of attributes with correct stereotypes, a, and the total count of attributes, b
 */
function checkStereotypeAttribute(element){
	var j=0;
	for (var k=0; k < element.Attributes.Count; k++){
		var attr = element.Attributes.GetAt(k);

		if (String(attr.StereotypeEx).includes(',')){
			LOGError("Attribute '" + attr.Name + "' in elementet '" + element.Name + "' has too many stereotypes.");
			Session.Output("Attributten '" + attr.Name + "' i elementet '" + element.Name + "' har for mange stereotyper.");
		} 
		else if (attr.Stereotype.includes(allowedstereotypesAttributeRole)){
			j+=1;
		} else {
			LOGError("Attribute '" + attr.Name + "' in elementet '" + element.Name + "' has wrong stereotype.");
			Session.Output("Attributten '" + attr.Name + "' i elementet '" + element.Name + "' har ikke korrekt stereotype.");
		}
	}
	return [j, element.Attributes.Count]
}

/**
 * Function to check if the connector ends of a given element have an allowed stereotype. Four numbers are returned; the number of connector ends (client and supplier) with correct stereotypes, 
 * the total count of unique connector ends, and a count of instances with applied stereotype but no role.
 * 
 * @param element {EA.Element}
 * @return variables [a, b, c, d]. Depicting a, b: the number of connector ends (client and supplier) with correct stereotypes, c; the total count
 * of unique connector ends, and d; a count of instances with applied stereotype but no role.
 */
function checkStereotypeConnectorEnd(element){

	var currentConnector as EA.Connector;
	var clientEnd as EA.ConnectorEnd;
	var supplierEnd as EA.ConnectorEnd;
	var j=0;
	var m=0;
	var n=0; 
	var connectorSet = new Set();

	connectors = element.Connectors;
	for (var i = 0 ; i < connectors.Count ; i++)
	{
		currentConnector = connectors.GetAt(i);

		if(currentConnector.Type == 'Association' || currentConnector.Type == 'Aggregation')
		{		
			if(connectorSet.has(currentConnector.ConnectorID) == false){
				connectorSet.add(currentConnector.ConnectorID);
				clientEnd = currentConnector.ClientEnd;
				
				//Hvis der er tastet et navn ind på rollen, så skal der også være en stereotype tilknyttet 
				if(clientEnd.Role.length > 0){

					if(clientEnd.StereotypeEx.includes(",")){
						LOGError("Role '" + clientEnd.Role + "' in elementet '" + element.Name + "' has too many stereotypes.");
						Session.Output("Source-rollen '" + clientEnd.Role + "' i elementet '" + element.Name + "' har for mange stereotyper.");
					} else if (clientEnd.Stereotype.length == 0){
						LOGError("Role '" + clientEnd.Role + "' in elementet '" + element.Name + "' has no stereotype.");
						Session.Output("Source-rollen '" + clientEnd.Role + "' i elementet '" + element.Name + "' har ingen stereotype.");
					} else if (clientEnd.StereotypeEx.includes(allowedstereotypesAttributeRole)){
						j+=1;
					} else {
						LOGError("Role '" + clientEnd.Role + "' in elementet '" + element.Name + "' has wrong stereotype.");
						Session.Output("Source-rollen '" + clientEnd.Role + "' i elementet '" + element.Name + "' har ikke korrekt stereotype.");
					}
				}
				
				supplierEnd = currentConnector.SupplierEnd;

				if(supplierEnd.Role.length > 0){

					if(String(supplierEnd.StereotypeEx).includes(",")){
						LOGError("Role '" + supplierEnd.Role + "' in elementet '" + element.Name + "' has too many stereotypes.");
						Session.Output("Target-rollen '" + supplierEnd.Role + "' i elementet '" + element.Name + "' har for mange stereotyper.");
					} else if (supplierEnd.Stereotype.length == 0){
						LOGError("Role '" + supplierEnd.Role + "' in elementet '" + element.Name + "' has no stereotype.");
						Session.Output("Target-rollen '" + supplierEnd.Role + "' i elementet '" + element.Name + "' har ingen stereotype.");
					} else if (supplierEnd.StereotypeEx.includes(allowedstereotypesAttributeRole)){
						m+=1;
					} else {
						LOGError("Role '" + supplierEnd.Role + "' in elementet '" + element.Name + "' has wrong stereotype.");
						Session.Output("Target-rollen '" + supplierEnd.Role + "' i elementet '" + element.Name + "' har ikke korrekt stereotype.");
					}
				}
				
				// Hvis der er en stereotype, men intet rollenavn, så er det en fejl
				if(clientEnd.Stereotype.length > 0 && clientEnd.Role.length == 0){
					LOGError("Empty role in elementet '" + element.Name + "', but stereotype given.");
					Session.Output("Source-rollen i elementet '" + element.Name + "' er tom, men stereotype er angivet.");
					n+=1;
				}
				
				if(supplierEnd.Stereotype.length > 0 && supplierEnd.Role.length == 0){
					LOGError("Empty role in elementet '" + element.Name + "', but stereotype given.");
					Session.Output("Target-rollen i elementet '" + element.Name + "' er tom, men stereotype er angivet.");
					n+=1;
				}
			}
		}
	}
	return [j, m, connectorSet.size, n];
}

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [title (da), description (da), language, modelScope]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags1(selectedPackage){
	
	var title = checkTagPackage(selectedPackage, "title (da)", "noTag");
	var desc = checkTagPackage(selectedPackage, "description (da)", "noTag");
	var lang = checkTagPackage(selectedPackage, "language", "noTag");
	var mscope = checkTagPackage(selectedPackage, "modelScope", "noTag");
	var j = 0
	
	if (title == null || title == ""){
		LOGError("No value given on tagged value 'title (da)' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' mangler 'title (da)'.");
	} else {j += 1}
	if (desc == null || desc == ""){
		LOGError("No value given on tagged value 'description (da)' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' mangler 'description (da)'.");
	} else {j += 1}	
	if (lang != "da"){
		LOGError("Wrong value given on tagged value 'language' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' skal have udfyldt 'language' med \"da\".");
	} else {j += 1}
	if (mscope != "application model"){
		LOGError("Wrong value given on tagged value 'modelScope' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' skal have udfyldt 'model scope' med \"application model\".");
	} else {j += 1}
	if (j==4) {Session.Output("OK")}	
}

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [namespace, namespacePrefix]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags2(selectedPackage){
	
	var nspace = checkTagPackage(selectedPackage, "namespace", "noTag");
	var nspacepf = checkTagPackage(selectedPackage, "namespacePrefix", "noTag");
	var j = 0
	
	if (nspace == null || nspace == ""){
		LOGError("No value given on tagged value 'namespace' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' mangler 'namespace'.")
	} else {j += 1}
	if (/\bhttps:\/\/data.gov.dk\/model\/profile/g.test(nspace) == false){
		LOGError("Wrong value given on tagged value 'namespace' on package " + selectedPackage.Name);
		Session.Output("'namespace' starter ikke med \"https://data.gov.dk/model/profile\".");
	} else {j += 1}
	if (nspacepf == null || nspacepf == ""){
		LOGError("No value given on tagged value 'namespacePrefix' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' mangler 'namespacePrefix'.");
	} else {j += 1}
	if (j==3) {Session.Output("OK");}	
}	

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [responsibleEntity]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags3(selectedPackage){
	
	var respent = checkTagPackage(selectedPackage, "responsibleEntity", "noTag");
	var j = 0
	
	Session.Output(selectedPackage.Name + ": 'responsibleEntity' = " + respent);	
	if (respent == "noTag"){
		//do nothing
	}
	else if (respent == null || respent == ""){
		LOGError("No value given on tagged value 'responsibleEntity' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' mangler 'responsibleEntity'.");
	} else {Session.Output("OK")}
}	

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [theme]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags4(selectedPackage){
	
	var theme = checkTagPackage(selectedPackage, "theme", "noTag");
	var j = 0
	
	if (theme == "" ){
		LOGError("No value given on tagged value 'theme' on package " + selectedPackage.Name);
		Session.Output("Pakken med navn '" + selectedPackage.Name + "' mangler 'theme'.");
	} else {j += 1}
	if (/\bhttp/.test(theme) == false){
		LOGError("Wrong or no value given on tagged value 'theme' on package " + selectedPackage.Name);
		Session.Output("'theme' starter ikke med \"https\".");
	} else {j += 1}
	if (j==2) {Session.Output("OK");}	
}

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [modified, versionInfo]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags5(selectedPackage){
	
	var modified = checkTagPackage(selectedPackage, "modified", "noTag");
	var versionInfo = checkTagPackage(selectedPackage, "versionInfo", "noTag");
	var j = 0
	
	//Vi skal lige have set på den her tag. Kan den læses både som yyyy-mm-dd OG dd-mm-yyyy??
	if (/20[0-9][0-9]-[0-1][0-9]-[0-3][0-9]/.test(modified) == false && /[0-3][0-9]-[0-1][0-9]-20[0-9][0-9]/.test(modified) == false){
		LOGError("Wrong or no value given on tagged value 'modified' on package " + selectedPackage.Name);
		Session.Output("'modified' er ikke opbygget iht. xsd:date 26 (YYYY-MM-DD).");
	} else {j += 1}
	if (/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(versionInfo) == false){
		LOGError("Wrong or no value given on tagged value 'versionInfo' on package " + selectedPackage.Name);
		Session.Output("'versionInfo' er ikke opbygget iht. (0-9).(0-9).(0-9)");
	} else {j += 1}
	if (j==2) {Session.Output("OK");}	
}

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [approvalStatus,approvedBy]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags6(selectedPackage){
	
	var apprStatus = checkTagPackage(selectedPackage, "approvalStatus", "noTag");
	var apprBy = checkTagPackage(selectedPackage, "approvedBy", "noTag");	
	var j = 0
	
	Session.Output("Modellens nuværende status: " + apprStatus);
	if (/approved/.test(apprStatus) == false){
		LOGError("Wrong or no value given on tagged value 'approvalStatus' on package " + selectedPackage.Name);
		Session.Output("'approvalStatus' har ikke værdi approved");
	} else {j += 1}	
	if (apprBy != "Grunddata Arkitekturforum" && apprBy != "Grunddata Modelsekretariatet"){
		LOGError("Wrong or no value given on tagged value 'approvedBy' on package " + selectedPackage.Name);
		Session.Output("'approvedBy' har ikke værdi fra listen (Grunddata Arkitekturforum, Grunddata Modelsekretariatet).");
	} else {j += 1}
}

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [modelStatus]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags7(selectedPackage){
	
	var mstatus = checkTagPackage(selectedPackage, "modelStatus", "noTag");
	
	if (mstatus != "development" && mstatus != "stable"){
		LOGError("Wrong or no value given on tagged value 'modelStatus' on package " + selectedPackage.Name);
		Session.Output("'modelStatus' har ikke værdi fra listen (development, stable).");
	} else {Session.Output("OK");}
}

/**
 * Validate if the tagged values of the selected model follows the basic data model rules version 2.
 * List of tagged values [legalSource,source]
 *
 * @param package {EA.Package}
 * @summary Validation of model tagged values
 */
function modeltags8(selectedPackage){	
	
	var legalSource = checkTagPackage(selectedPackage, "legalSource", "noTag");
	var source = checkTagPackage(selectedPackage, "source", "noTag");
	var j=0
	
	if (/\bhttps:\/\/www.retsinformation.dk\/eli\/lta/i.test(legalSource) == false && /\bhttp:\/\/www.retsinformation.dk\/eli\/lta/i.test(legalSource) == false){
		LOGError("Wrong or no value given on tagged value 'legalSource' on package " + selectedPackage.Name);
		Session.Output("'legalSource' starter ikke med enten \"https://www.retsinformation.dk/eli/lta/\" eller \"http://www.retsinformation.dk/eli/lta/\".");
	} else {j +=1 }
	if (source.trim().length == 0){
		LOGError("No value given on tagged value 'source' on package " + selectedPackage.Name);
		Session.Output("'source' er tom for pakken "+ selectedPackage.Name);
	} else {j +=1}
	if (j==2) {Session.Output("OK");}
}

/**
 * Script to check if a tag on a package exists. If it does, the value of the tag is returned.
 *
 * @param package, tag, default value
 * @return the tagged value
 */
function checkTagPackage(package, tag, defaultval) {
	var result=getTaggedValueElement(package.Element, tag, defaultval);
	if (result==defaultval){
		LOGError("No tag called "+ tag + " on package " + package.Name);
		Session.Output("Tagget '" + tag + "' på pakken '" + package.Name+ "' findes ikke.");
		return result;
	} else { 
		LOGTrace("Value of '" + tag + "' on package '" + package.Name + ": " + result);
		return result;
	}
}

/**
 * Script to check the model element tagged value 'URI'. It has to follow the basic data model rules version 2.
 *
 * @param element
 */
function identifikator(elements)
{	
	var q = 0;
	var r = 0;
	var URI_list = [];
	
	for (var i = 0; i < elements.length; i++) {
		currentElement = elements[i];
		if (currentElement.Type == "Class" || currentElement.Type == "DataType" || currentElement.Type == "Enumeration") {
			var URI = getTaggedValueElement(currentElement, "URI", "noTag");		
			if (/\bhttps:\/\/data.gov.dk\/model\/profile\//g.test(URI) == false){
				q+=1;
				LOGError("Wrong value given on tagged value 'URI' on element '"+ currentElement.Name + "'.");
				Session.Output("'URI' starter ikke med \"https://data.gov.dk/model/profile/\" i elementet med navn '" + currentElement.Name + "'.")
			}
			for (var j = 0; j < URI_list.length; j++) {
				if (URI == URI_list[j]) {
					q+=1;
					Session.Output("'URI' i elementet med navn '" + currentElement.Name + "' er ikke unik i modellen.");
				}
			}
			URI_list.push(URI);
			
			// Tjek af attributters URI	
			for (var k=0; k < currentElement.Attributes.Count; k++){
				var attr = currentElement.Attributes.GetAt(k);
				var URIAttr = getTaggedValueAttribute(attr, "URI", "noTag");				
				if (currentElement.Type == "Class" || currentElement.Type == "DataType") {
						
					if (/\bhttps:\/\/data.gov.dk\/model\/profile\//g.test(URIAttr) == false){
						LOGError("Wrong value given on tagged value 'URI' on the attribute '" + attr.Name + "' associated with element '" + currentElement.Name +"'.");
						Session.Output("'URI' på attributten med navn '" + attr.Name + "' tilknyttet elementet '" + currentElement.Name +"' starter ikke med \"https://data.gov.dk/model/profile/\".");
						r+=1;
					} 
				}
			}			
		}		
	}
	
	if (q==0 && r==0) {Session.Output("OK");}
}

/**
 * Script to check the model element tagged value 'prefLabel (da)'. It has to follow the basic data model rules version 2.
 *
 * @param element
 */
function sprog(elements)
{	
	var q = 0;
	var r = 0;
	
	for (var i = 0; i < elements.length; i++) {
		currentElement = elements[i];
		//Hov, hvorfor tjekker jeg kun på de tre typer af elementer?? Nok fordi at stregerne mellem elementerne er af typen ProxyConnector, og de har ikke stereotyper 
		if (currentElement.Type == "Class" || currentElement.Type == "DataType" || currentElement.Type == "Enumeration") {
			var prefLabelValue = getTaggedValueElement(currentElement, "prefLabel (da)", "noTag");
			if (prefLabelValue == null || prefLabelValue == ""){
				LOGError("No value given on tagged value 'prefLabel (da)' on element '" + currentElement.Name);
				Session.Output("Elementet med navn '" + currentElement.Name + "' mangler værdi for 'prefLabel (da)'.");
				q+=1;
			}	
		
			// Tjek af attributters "prefLabel (da)"
			for (var k=0; k < currentElement.Attributes.Count; k++){
				var attr = currentElement.Attributes.GetAt(k);
				var prefLabelAttr = getTaggedValueAttribute(attr, "prefLabel (da)", "noTag");				
				if (currentElement.Type == "Class" || currentElement.Type == "DataType") {
						
					if (prefLabelAttr == null || prefLabelAttr == ""){
						LOGError("No value given on tagged value 'prefLabel (da)' on the attribute '" + attr.Name + "' associated with element '" + currentElement.Name +"'.");
						Session.Output("'prefLabel (da)' på attributten med navn '" + attr.Name + "' tilknyttet elementet '" + currentElement.Name +"' er ikke udfyldt.");
						r+=1;
					} 
				}
			}
		}
	}
	
	if (q==0 && r==0) {Session.Output("OK");}
}

/**
 * Validate whether or not an element name is in upper camel case and an attribute name is in lower camel case.
 * Only Danish letters and numbers are allowed.
 *
 * @param element
 */
function checkCamel(elements){

	var r = 0;
	var connectorSet = new Set();

	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		//Vi ser lige bort fra de der proxyer.	
		if (currentElement.Type != 'ProxyConnector'){

			if (upperCamel.includes(currentElement.Type)){
				if (/^[A-Z]|^Æ|^Ø|^Å|^[0-9]/.test(currentElement.Name) == false){
					LOGError("Name not in upper camel case: "+ currentElement.Name );
					Session.Output("Elementet med navn '" + currentElement.Name + "' er ikke i UpperCamelCase");
					r+=1;
				}
			}	
		
			//Tjek af connectors navne
			var connectors as EA.Collection;
			connectors = currentElement.Connectors;
			for (var j = 0; j < connectors.Count; j++){
				var currentConnector as EA.Connector;
				currentConnector = connectors.GetAt(j);		
				
				if(connectorSet.has(currentConnector.ConnectorID) == false){
					connectorSet.add(currentConnector.ConnectorID);

					if (lowerCamel.includes(currentConnector.Type)){
						if (/(^[a-z]|^æ|^ø|^å|^[0-9])/.test(currentConnector.Name) == false){
							LOGError("Connector element not in lower camel case: (GUID) "+ currentConnector.ConnectorGUID);
							Session.Output("Connectoren med navn '" + currentConnector.Name + "' er ikke i lowerCamelCase."); 
							r+=1;
						}
						
						clientEnd = currentConnector.ClientEnd;
						supplierEnd = currentConnector.SupplierEnd;
						
						if (clientEnd.Role){
							if (/(^[a-z]|^æ|^ø|^å|^[0-9])/.test(clientEnd.Role) == false){
								LOGError("Role not in lower camel case: "+ clientEnd.Role );
								Session.Output("Enden med rolle '" + clientEnd.Role + "' tilknyttet connectoren med navn '" + currentConnector.Name + "' er ikke i lowerCamelCase");
								r+=1;
							}							
						}
						
						if (supplierEnd.Role){
							if (/(^[a-z]|^æ|^ø|^å|^[0-9])/.test(supplierEnd.Role) == false){
								LOGError("Role not in lower camel case: "+ supplierEnd.Role );
								Session.Output("Enden med rolle '" + supplierEnd.Role +  "' tilknyttet connectoren med navn '" + currentConnector.Name + "' er ikke i lowerCamelCase");
								r+=1;
							}								
						}
					}
				}
			}
				
			// Tjek af attributters navne	
			for (var k=0; k < currentElement.Attributes.Count; k++){
				var attr = currentElement.Attributes.GetAt(k).Name; 
				if (currentElement.Type == "Class" || currentElement.Type == "DataType") {
						
					if (/(^[a-z]|^æ|^ø|^å)/.test(attr) == false){
						LOGError("Attribute not in lower camel case: '" + attr + "' associated with element '" + currentElement.Name +"' is wrong. Upper bound is lower than lower bound.");
						Session.Output("Attributten med navn '" + attr + "' tilknyttet elementet '" + currentElement.Name +"' er ikke i lowerCamelCase.");
						r+=1;
					} 
				}
			}
		}			
	}
	
	if (r == 0){
		Session.Output("OK");
	}
}

/**
 * Check the tagged value 'definition (da)' on model element. It has to follow the basic data model rules version 2.
 *
 * @param element
 */
function checkDef(elements){

	var r = 0;
	var o = 0;
	
	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		//Vi ser lige bort fra de der proxyer og tekstfelter.
		if (currentElement.Type != 'ProxyConnector' && currentElement.Type != 'Text'){
			var defElement = getTaggedValueElement(currentElement, "definition (da)", "noTag");
			
			if (defElement == "noTag" || defElement == ""){
				Session.Output("Ingen definition på elementet '" + currentElement.Name + "'.");
				r+=1;
			} else {
				if (/^[a-z]|^æ|^ø|^å|^[0-9]/.test(defElement) == false){
					LOGError("Definition on element '" + currentElement.Name  + "' does not begin with small letter.");
					Session.Output("Definitionen angivet for elementet '" + currentElement.Name + "' begynder ikke med lille bogstav.");
					r+=1;
				} 

				if (defElement.trim().length != defElement.length){//not an error, but inform the user (r is not increased)
					LOGError("Definition on element '" + currentElement.Name  + "' begins or ends with whitespace." );
					Session.Output("Definitionen angivet for elementet '" + currentElement.Name + "' starter eller slutter med whitespace.");
				}
				
				if (defElement.charAt(defElement.trim().length-1) == "."){
					LOGError("Definition on element '" + currentElement.Name + "' ends with a period ");
					Session.Output("Definitionen angivet for elementet '" + currentElement.Name + "' slutter med et punktum.");
					r+=1;
				} 
			}
		
			for (var k=0; k < currentElement.Attributes.Count; k++){
				var attr = currentElement.Attributes.GetAt(k);
				
				var defAttr = getTaggedValueAttribute(attr, "definition (da)", "noTag");
				if (defAttr == "noTag" || defAttr == ""){
					Session.Output("Ingen definition på attributten '" + attr.Name + "' for elementet '" + currentElement.Name+ "'.");
					r+=1;
				} else {
					if (/^[a-z]|^æ|^ø|^å|^[0-9]/.test(defAttr) == false){
						LOGError("Definition on attribute '" + attr.Name + "' on element '" + currentElement.Name  + "' does not begin with small letter." );
						Session.Output("Definitionen angivet på attributten '" + attr.Name + "' for elementet '" + currentElement.Name + "' begynder ikke med lille bogstav.");
						r+=1;
					} 

					if (defAttr.trim().length != defAttr.length){ //not an error, but inform the user (r is not increased) 
						LOGError("Definition on attribute '" + attr.Name + "' on element '" + currentElement.Name  + "' begins or ends with whitespace." );
						Session.Output("Definitionen angivet på attributten '" + attr.Name + "' for elementet '" + currentElement.Name + "' starter eller slutter med whitespace.");
					}
					
					if (defAttr.charAt(defAttr.trim().length-1) == "."){
						LOGError("Definition on attribute '" + attr.Name + "' on element '" + currentElement.Name  + "' ends with a period." );
						Session.Output("Definitionen angivet på attributten '" + attr.Name + "' for elementet '" + currentElement.Name + "' slutter med et punktum.");
						r+=1;
					} 
				}		
			}
		}
	}
	
	if (r == 0){
		Session.Output("OK");
	}
}

/**
 * Check the tagged value 'legalSource' on model element. It has to follow the basic data model rules version 2.
 *
 * @param element
 */
function checkLegal(elements){

	var o = 0;
	
	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		//Vi ser lige bort fra elementer, der ikke har relevans her.
		if (omitUMLelements.includes(currentElement.Type) == false){
		
			var legalSourceElement = getTaggedValueElement(currentElement, "legalSource", "noTag");
			if (legalSourceElement == "noTag" || legalSourceElement == ""){
				Session.Output("Ingen 'legalSource' på elementet '" + currentElement.Name + "'.");
				o+=1;
			} else {
				if (/\bhttps:\/\/www.retsinformation.dk\/eli\/lta/i.test(legalSourceElement) == false && /\bhttp:\/\/www.retsinformation.dk\/eli\/lta/i.test(legalSourceElement) == false){
					LOGError("Wrong value given on tagged value 'legalSource' on element '" + currentElement.Name );
					Session.Output("'legalSource' starter ikke med enten \"https://www.retsinformation.dk/eli/lta/\" eller \"http://www.retsinformation.dk/eli/lta/\" på elementet '" + currentElement.Name + "'.");
					o+=1;
				} 
			}
		}
	}
	
	if (o == 0){
		Session.Output("OK");
	}
}

/**
 * Check the data types of the attributes. It has to be ISO types.
 *
 * @param element
 */
function ISOtype(elements)
{
	var r = 0;
	
	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		//Vi ser lige bort fra de der proxyer og enumerationer
		if (currentElement.Type != 'ProxyConnector' && currentElement.Type != "Enumeration"){

			for (var k=0; k < currentElement.Attributes.Count; k++){
				var attr = currentElement.Attributes.GetAt(k);

				if (attr.ClassifierID == null || attr.ClassifierID == 0){
					Session.Output("Datatype på attributten '" + attr.Name + "' for elementet '" + currentElement.Name+ "' er ikke en ISO-type.");
					r+=1;
				}
			}
		}
	}
	
	if (r == 0){
		Session.Output("OK");
	}		
}

/**
 * Check if the tag 'historikmodel' for model elements is valid. It has to be either "registreringshistorik" or "bitemporalitet"
 *
 * @param element
 */
function historik(elements)
{	
	var r = 0;
	
	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype")) {
			
			var histTag = getTaggedValueElement(currentElement, 'historikmodel', 'noTag');
			if (histTag == "bitemporalitet" || histTag == "registreringshistorik"){
				//do nothing
				//Session.Output("alt er godt");
			} else {
				LOGError("Wrong or no 'historikmodel' on element '" + currentElement.Name + "'.");
				Session.Output("Forkert angivet 'historikmodel' for elementet '" + currentElement.Name + "'.");
				r+=1;
			}
		}
	}

	if (r == 0){
		Session.Output("OK");
	}
}


/**
 * Check if the object type elements have an attribute called 'id' with correct multiplicity and type. 
 *
 * @param element
 */
function checkID(elements)
{	
	var count = 0; //no. elements
	var IDcount = 0; //no. id attributes
	
	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype") || currentElement.HasStereotype("Grunddata2::DKDatatype")) {
			elementIDlist.push(currentElement.ElementID);
		}
	}
	
	for (var i = 0; i < elements.length; i++) {
		
		var currentElement = elements[i];		
		
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype")) {
			count+=1;
			var r = 0;
			var multifejl = 0;
			var typefejl = 0;
			
			for (var k=0; k < currentElement.AttributesEx.Count; k++){
				var currentAttr = currentElement.AttributesEx.GetAt(k);
				
				if (currentAttr.Name == "id"){
					r+=1;
					if(currentAttr.UpperBound != 1 || currentAttr.LowerBound != 1){
						multifejl += 1;
					}
					if(currentAttr.Type != "CharacterString"){
						typefejl += 1;
					}
				}
				
				if (elementIDlist.includes(currentAttr.ClassifierID)){
					for (var j=0; j < elements.length; j++) {
						
						var currentElementTemp = elements[j];
						
						if (currentElementTemp.ElementID == currentAttr.ClassifierID){
							for (var l=0; l < currentElementTemp.Attributes.Count; l++){
								
								var currentAttrTemp = currentElementTemp.Attributes.GetAt(l);
								
								if (currentAttrTemp.Name == "id"){
									r+=1;
									if(currentAttrTemp.UpperBound != 1 || currentAttrTemp.LowerBound != 1){
										multifejl += 1;
									}
									if(currentAttrTemp.Type != "CharacterString"){
										typefejl += 1;
									}
								} 
							}
						}					
					}
				}
			}
			
			if (r==0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype mangler at modelleres med attributten id.");
			}
			
			if (typefejl != 0){
				Session.Output("Egenskaben id på elementet '"+ currentElement.Name + "' er ikke af datatypen CharacterString.");
			}
			
			if (multifejl != 0){
				Session.Output("Egenskaben id på elementet '"+ currentElement.Name + "' har ikke multiplicitet 1.");
			}
			
			IDcount = IDcount + r					
		} 	
	} 

	if (IDcount == count && multifejl == 0 && typefejl == 0){
		Session.Output("OK");
	}		
}

/**
 * Check if the object type elements have attributes called 'registreringFra', 'registreringTil' and 'registreringsaktør' with correct multiplicity and type. 
 *
 * @param element
 */
function checkReg(elements)
{	
	var count = 0; //no. elements
	var regcountFra = 0; //no. registreringFra attributes
	var regcountTil = 0; //no. registreringTil attributes
	var regcountAkt = 0; //no. registreringsaktør attributes
	
	for (var i = 0; i < elements.length; i++) {
		
		var currentElement = elements[i];		
		
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype")) {
			count+=1;
			var rFra = 0;
			var rTil = 0;
			var rAkt = 0;
			var multifejlFra = 0;
			var multifejlTil = 0;
			var multifejlAkt = 0;
			var typefejlFra = 0;
			var typefejlTil = 0;
			var typefejlAkt = 0;
			
			for (var k=0; k < currentElement.AttributesEx.Count; k++){
				var currentAttr = currentElement.AttributesEx.GetAt(k);
				
				if (currentAttr.Name == "registreringFra"){
					rFra+=1;
					if(currentAttr.UpperBound != 1 || currentAttr.LowerBound != 1){
						multifejlFra += 1;
					}
					if(currentAttr.Type != "DateTime"){
						typefejlFra += 1;
					}
				}
				if (currentAttr.Name == "registreringTil"){
					rTil+=1;
					if(currentAttr.UpperBound != 1 || currentAttr.LowerBound != 0){
						multifejlTil += 1;
					}
					if(currentAttr.Type != "DateTime"){
						typefejlTil += 1;
					}
				}
				if (currentAttr.Name == "registreringsaktør"){
					rAkt+=1;
					if(currentAttr.UpperBound != 1 || currentAttr.LowerBound != 1){
						multifejlAkt += 1;
					}
					if(currentAttr.Type != "CharacterString"){
						typefejlAkt += 1;
					}
				}
				
				if (elementIDlist.includes(currentAttr.ClassifierID)){
					for (var j=0; j < elements.length; j++) {
						
						var currentElementTemp = elements[j];
						
						if (currentElementTemp.ElementID == currentAttr.ClassifierID){
							for (var l=0; l < currentElementTemp.Attributes.Count; l++){
								
								var currentAttrTemp = currentElementTemp.Attributes.GetAt(l);
								
								if (currentAttrTemp.Name == "registreringFra"){
									rFra+=1;
									if(currentAttrTemp.UpperBound != 1 || currentAttrTemp.LowerBound != 1){
										multifejlFra += 1;
									}
									if(currentAttrTemp.Type != "DateTime"){
										typefejlFra += 1;
									}
								}
								if (currentAttrTemp.Name == "registreringTil"){
									rTil+=1;
									if(currentAttrTemp.UpperBound != 1 || currentAttrTemp.LowerBound != 0){
										multifejlTil += 1;
									}
									if(currentAttrTemp.Type != "DateTime"){
										typefejlTil += 1;
									}
								}
								if (currentAttrTemp.Name == "registreringsaktør"){
									rAkt+=1;
									if(currentAttrTemp.UpperBound != 1 || currentAttrTemp.LowerBound != 1){
										multifejlAkt += 1;
									}
									if(currentAttrTemp.Type != "CharacterString"){
										typefejlAkt += 1;
									}
								}
							}
						}					
					}
				}
			}
			
			if (rFra == 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype mangler at modelleres med attributten registreringFra.");
			}
			
			if (typefejlFra != 0){
				Session.Output("Egenskaben registreringFra på elementet '"+ currentElement.Name + "' er ikke af datatypen DateTime.");
			}
			
			if (multifejlFra != 0){
				Session.Output("Egenskaben registreringFra på elementet '"+ currentElement.Name + "' har ikke multiplicitet 1.");
			}
			if (rTil == 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype mangler at modelleres med attributten registreringTil.");
			}
			
			if (typefejlTil != 0){
				Session.Output("Egenskaben registreringTil på elementet '"+ currentElement.Name + "' er ikke af datatypen DateTime.");
			}
			
			if (multifejlTil != 0){
				Session.Output("Egenskaben registreringTil på elementet '"+ currentElement.Name + "' har ikke multiplicitet 1.");
			}
			if (rAkt == 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype mangler at modelleres med attributten registreringsaktør.");
			}
			
			if (typefejlAkt != 0){
				Session.Output("Egenskaben registreringsaktør på elementet '"+ currentElement.Name + "' er ikke af datatypen CharacterString.");
			}
			
			if (multifejlAkt != 0){
				Session.Output("Egenskaben registreringsaktør på elementet '"+ currentElement.Name + "' har ikke multiplicitet 1.");
			}

			
			regcountFra = regcountFra + rFra
			regcountTil = regcountTil + rTil
			regcountAkt = regcountAkt + rAkt			
		} 	
	} 

	if (regcountFra == count && regcountTil == count && regcountAkt == count && typefejlFra == 0 && multifejlFra == 0 && typefejlTil == 0 && multifejlTil == 0 && typefejlAkt == 0 && multifejlAkt == 0){
		Session.Output("OK");
	}		
}

/**
 * If a modelelement is labelled with 'bitemporalitet' virkningstid is mandatory. 
 * The function here checks if any attributes exist named 'virkning*'.
 *
 * @param element
 */
function checkVirk(elements)
{		
	var count = 0; //no. elements with bitemporalitet
	var countVirkFra = 0; //no. virkningFra attributes
	var countVirkTil = 0; //no. virkningTil attributes
	var countVirkAkt = 0; //no. virkningsaktør attributes	
	var multifejlFra = 0;
	var multifejlTil = 0;
	var multifejlAkt = 0;
	var typefejlFra = 0;
	var typefejlTil = 0;
	var typefejlAkt = 0;

	var missing = 0;
	
	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		var histTag = getTaggedValueElement(currentElement, 'historikmodel', 'noTag');
		//Session.Output("Tagget: "+histTag + "    Elementet: " +currentElement.Name + "     Stereotypen: " +currentElement.Stereotype)
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype") && histTag == "bitemporalitet") {
			
			count+=1;
			var rFra = 0;
			var rTil = 0;
			var rAkt = 0;
			var mFra = 0;
			var mTil = 0;
			var mAkt = 0;
			var tFra = 0;
			var tTil = 0;
			var tAkt = 0;
			
			for (var k=0; k < currentElement.AttributesEx.Count; k++){
				var currentAttr = currentElement.AttributesEx.GetAt(k);
				
				if (currentAttr.Name == "virkningFra"){
					rFra+=1;
					if(currentAttr.UpperBound != 1 || currentAttr.LowerBound != 1){
						mFra += 1;
					}
					if(currentAttr.Type != "DateTime" && currentAttr.Type != "Date"){
						tFra += 1;
					}
				}
				if (currentAttr.Name == "virkningTil"){
					rTil+=1;
					if(currentAttr.UpperBound != 1 || currentAttr.LowerBound != 0){
						mTil += 1;
					}
					if(currentAttr.Type != "DateTime" && currentAttr.Type != "Date"){
						tTil += 1;
					}
				}
				if (currentAttr.Name == "virkningsaktør"){
					rAkt+=1;
					if(currentAttr.UpperBound != 1 || currentAttr.LowerBound != 1){
						mAkt += 1;
					}
					if(currentAttr.Type != "CharacterString"){
						tAkt += 1;
					}
				}
				
				if (elementIDlist.includes(currentAttr.ClassifierID)){
					for (var j=0; j < elements.length; j++) {
						
						var currentElementTemp = elements[j];
						
						if (currentElementTemp.ElementID == currentAttr.ClassifierID){
							for (var l=0; l < currentElementTemp.Attributes.Count; l++){
								
								var currentAttrTemp = currentElementTemp.Attributes.GetAt(l);
								
								if (currentAttrTemp.Name == "virkningFra"){
									rFra+=1;
									if(currentAttrTemp.UpperBound != 1 || currentAttrTemp.LowerBound != 1){
										mFra += 1;
									}
									if(currentAttrTemp.Type != "DateTime" && currentAttrTemp.Type != "Date"){
										tFra += 1;
									}
								}
								if (currentAttrTemp.Name == "virkningTil"){
									rTil+=1;
									if(currentAttrTemp.UpperBound != 1 || currentAttrTemp.LowerBound != 0){
										mTil += 1;
									}
									if(currentAttrTemp.Type != "DateTime" && currentAttrTemp.Type != "Date"){
										tTil += 1;
									}
								}
								if (currentAttrTemp.Name == "virkningsaktør"){
									rAkt+=1;
									if(currentAttrTemp.UpperBound != 1 || currentAttrTemp.LowerBound != 1){
										mAkt += 1;
									}
									if(currentAttrTemp.Type != "CharacterString"){
										tAkt += 1;
									}
								}
							}
						}					
					}
				}
			}
			
			if (rFra == 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype mangler at modelleres med attributten virkningFra.");
			}
			
			if (typefejlFra != 0){
				Session.Output("Egenskaben 'virkningFra' på elementet '"+ currentElement.Name + "' er ikke af datatypen DateTime eller Date.");
			}
			
			if (multifejlFra != 0){
				Session.Output("Egenskaben 'virkningFra' på elementet '"+ currentElement.Name + "' har ikke multiplicitet 1.");
			}
			if (rTil == 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype mangler at modelleres med attributten virkningTil.");
			}
			
			if (typefejlTil != 0){
				Session.Output("Egenskaben 'virkningTil' på elementet '"+ currentElement.Name + "' er ikke af datatypen DateTime eller Date.");
			}
			
			if (multifejlTil != 0){
				Session.Output("Egenskaben 'virkningTil' på elementet '"+ currentElement.Name + "' har ikke multiplicitet 1.");
			}
			if (rAkt == 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype mangler at modelleres med attributten virkningsaktør.");
			}
			
			if (typefejlAkt != 0){
				Session.Output("Egenskaben 'virkningsaktør' på elementet '"+ currentElement.Name + "' er ikke af datatypen CharacterString.");
			}
			
			if (multifejlAkt != 0){
				Session.Output("Egenskaben 'virkningsaktør' på elementet '"+ currentElement.Name + "' har ikke multiplicitet 1.");
			}
			
			countVirkFra = countVirkFra + rFra
			countVirkTil = countVirkTil + rTil
			countVirkAkt = countVirkAkt + rAkt	
			multifejlFra = multifejlFra + mFra;
			multifejlTil = multifejlTil + mTil;
			multifejlAkt = multifejlAkt + mAkt;
			typefejlFra = typefejlFra +tFra;
			typefejlTil = typefejlTil + tTil;
			typefejlAkt = typefejlAkt + tAkt;
		}
		
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype") && histTag == "" && currentElement.Type != "Text"){
			Session.Output("Elementet med navn '" + currentElement.Name + "' har ikke en værdi for tagget 'historikmodel'.");
			missing += 1;
		}
	}
	
	if (count == 0){
		Session.Output("Ingen elementer har angivet 'historikmodel' = bitemporalitet.");
	}
	else if (count != 0 && countVirkFra == count && countVirkTil == count && countVirkAkt == count && typefejlFra == 0 && multifejlFra == 0 && typefejlTil == 0 && multifejlTil == 0 && typefejlAkt == 0 && multifejlAkt == 0 && missing == 0){
		if (count == 1){
			Session.Output(count + " element med 'historikmodel' = bitemporalitet: OK");
		} else {Session.Output(count + " elementer med 'historikmodel' = bitemporalitet: OK");}		
	}
}

/**
 * If modelelement is labelled with 'registreringshistorik' no virkningstid is allowed.  
 * The function here checks if any attributes exist named 'virkning*'.
 *
 * @param element
 */
function historikReg(elements)
{			
	var count = 0; //no. elements with registreringshistorik	
	var countVirkFra = 0; //no. virkningFra attributes
	var countVirkTil = 0; //no. virkningTil attributes
	var countVirkAkt = 0; //no. virkningsaktør attributes

	
	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		var histTag = getTaggedValueElement(currentElement, 'historikmodel', 'noTagValue');
		//Session.Output("Tagget: "+histTag + "    Elementet: " +currentElement.Name + "     Stereotypen: " +currentElement.Stereotype)
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype") && histTag == "registreringshistorik"){
			count+=1;
			var rFra = 0;
			var rTil = 0;
			var rAkt = 0;
			
			for (var k=0; k < currentElement.Attributes.Count; k++){
				var currentAttr = currentElement.Attributes.GetAt(k);

				if (currentAttr.Name == "virkningFra"){
					rFra+=1;
				}
				if (currentAttr.Name == "virkningTil"){
					rTil+=1;
				}
				if (currentAttr.Name == "virkningsaktør"){
					rAkt+=1;
				}
				
				if (elementIDlist.includes(currentAttr.ClassifierID)){
					for (var j=0; j < elements.length; j++) {
						var currentElementTemp = elements[j];
						
						if (currentElementTemp.ElementID == currentAttr.ClassifierID){
							for (var l=0; l < currentElementTemp.Attributes.Count; l++){
								
								var currentAttrTemp = currentElementTemp.Attributes.GetAt(l);
								
								if (currentAttrTemp.Name == "virkningFra"){
									rFra+=1;
								}
								if (currentAttrTemp.Name == "virkningTil"){
									rTil+=1;
								}
								if (currentAttrTemp.Name == "virkningsaktør"){
									rAkt+=1;
								}
							}
						}
					}
				}
			}
			if (rFra != 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype er modelleret med attributten virkningFra.");
			}
			if (rTil != 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype er modelleret med attributten virkningTil.");
			}
			if (rAkt != 0){
				Session.Output("Grunddatatypen '" +currentElement.Name + "' af stereotypen DKObjekttype er modelleret med attributten virkningsaktør.");
			}
		}
	}
			
	countVirkFra = countVirkFra + rFra
	countVirkTil = countVirkTil + rTil
	countVirkAkt = countVirkAkt + rAkt	
	
	if (count == 0){
		Session.Output("Ingen elementer har angivet 'historikmodel' = registreringshistorik.");
	}
	else if (count != 0 && countVirkFra == 0 && countVirkTil == 0 && countVirkAkt == 0){
		if (count == 1){
			Session.Output(count + " element med 'historikmodel' = registreringshistorik: OK");
		} else {Session.Output(count + " elementer med 'historikmodel' = registreringshistorik: OK");}		
	}
}

/**
 * If a model element has attribute 'status', 'forretningshændelse' or 'forretningsproces' the attribute has to have datatype 'DKEnumeration' or 'DKKodeliste'.	
 * This function checks if the datatype for a given attribute is correct (input parameter).
 *
 * @param element, attribute name 
 * @return variables: OK (string)
 */
function checkAttr(elements,attributnavn)
{		
	var fejl = 0;
	
	var elementIDlistAll = [];
	for (var i = 0; i < elements.length; i++) {
		var currentElement = elements[i];
		
		elementIDlistAll.push(currentElement.ElementID);	
	}

	for (var i = 0; i < elements.length; i++) {

		var currentElement = elements[i];
		if (currentElement.HasStereotype("Grunddata2::DKObjekttype")) {
			for (var k=0; k < currentElement.Attributes.Count; k++){
				var currentAttr = currentElement.Attributes.GetAt(k);
				if (currentAttr.Name == attributnavn){
					if (elementIDlistAll.includes(currentAttr.ClassifierID)){
						for (var j=0; j < elements.length; j++) {
							var currentElementTemp = elements[j];
							//Session.Output("ElementType: "+currentElementTemp.Type);
							if (currentElementTemp.ElementID == currentAttr.ClassifierID){ 
								if (currentElementTemp.Type != "Enumeration" && currentElementTemp.Type != "Kodeliste" ){//Er det type eller stereotype? For navnet på en kodelistes type er også en Enumeration...
									fejl+=1;
									Session.Output("Attributten '"+ attributnavn + "' på elementet '"+ currentElement.Name + "' har ikke datatypen DKEnumeration eller DKKodeliste");
								}
							}
						}	
					} 
					else {
						fejl+=1;
						Session.Output("Attributten '"+ attributnavn + "' på elementet '"+ currentElement.Name + "' er ikke linket til korrekt datatypeelement.");
					}
				}
			}
		}
	}
	if (fejl == 0){
		return "OK";
		//Uncomment this line if run locally
		//Session.Output("OK"); 
	}
}

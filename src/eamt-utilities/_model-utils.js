/**
 * @file This file contains utility functions to assist with the retrieving model elements from the EA model.
 */

/**
 * @param aPackage {EA.Package}
 * @return {Array<EA.Element>} elements in the given package (including elements in all its subpackages)
 */
function getElementsOfPackageAndSubpackages(aPackage) {
	var elements = [];
	for (var i = 0; i < aPackage.Elements.Count; i++) {
		elements[i] = aPackage.Elements.GetAt(i);
	}
	for (var j = 0; j < aPackage.Packages.Count; j++) {
		// recursive function
		elements = elements.concat(getElementsOfPackageAndSubpackages(aPackage.Packages.GetAt(j)));
	}
	return elements;
}

/**
 * @param aPackage {EA.Package}
 * @return {Array<EA.Diagram>} diagrams in the given package (including diagrams in all its subpackages)
 */
function getDiagramsOfPackageAndSubpackages(aPackage) {
	var diagrams = [];
	for (var i = 0; i < aPackage.Diagrams.Count; i++) {
		diagrams[i] = aPackage.Diagrams.GetAt(i);
	}
	for (var j = 0; j < aPackage.Packages.Count; j++) {
		// recursive function
		diagrams = diagrams.concat(getDiagramsOfPackageAndSubpackages(aPackage.Packages.GetAt(j)));
	}
	return diagrams;
}

/**
 * @param aPackage {EA.Package}
 * @return {Array<EA.Package>} packages in the given package (including packages in all its subpackages)
 */
function getSubpackagesOfPackage(aPackage) {
	var packages = [];
	for (var i = 0; i < aPackage.Packages.Count; i++) {
		// recursive function
		packages = packages.concat(aPackage.Packages.GetAt(i), getSubpackagesOfPackage(aPackage.Packages.GetAt(i)));
	}
	return packages;
}

/**
 * @return Array<EA.Connector> associations (including the aggregations and compositions) that are version
 *         controlled in the given package or one of its subpackages.
 */
function getAssociationsOfPackageAndSubpackages(aPackage) {
	var element as EA.Element;
	var connector as EA.Connector;
	var addToMap;
	
	var elements = getElementsOfPackageAndSubpackages(aPackage);
	var connectorMap = new Map();
	
	for (var i = 0; i < elements.length; i++) {
		element = elements[i];
		for (var j = 0; j < element.Connectors.Count; j++) {
			connector = element.Connectors.GetAt(j);
			addToMap = isConnectorAssociationAndControlledInSamePackageAsElement(connector, element);
			if (addToMap) {
				if (!connectorMap.has(connector.ConnectorGUID)) {
					connectorMap.set(connector.ConnectorGUID, connector);
				}
			}
		}
	}
	return connectorMap.values();
}

/**
 * If a connector is controlled in the same package as a certain element, this means that both the element and the
 * connector can be changed when the package the element belongs to is checked out. See also
 * [Add Connectors To Locked Elements](https://www.sparxsystems.com/search/sphider/search.php?query=%22Add%20Connectors%20To%20Locked%20Elements%22&type=phrase&category=User+Guide+Latest&tab=5&search=1)
 * 
 * @return {boolean} whether the given connector is an association (including aggregations and compositions) controlled in the same package
 *         as in the given element
 */
function isConnectorAssociationAndControlledInSamePackageAsElement(aConnector /* : EA.Connector */, anElement /* : EA.Element */) /* : boolean */ {
	var result;
	result =
	(Repository.GetElementByID(aConnector.ClientID).PackageID == Repository.GetElementByID(aConnector.SupplierID).PackageID 
		&& (aConnector.Type == "Association" || aConnector.Type == "Aggregation"))
	||
	((aConnector.ClientID == anElement.ElementID && (aConnector.Type == "Association"))
	||
	(aConnector.SupplierID == anElement.ElementID && aConnector.Type == "Aggregation"));
	return result;
}

/**
 * @param {EA.Element}
 * @return {string} full path name of the given element (OCL style, see section 7.5.7 of the specification).
 */
function getPathnameOfElement(anElement) {
	var package as EA.Package;
	package = Repository.GetPackageByID(anElement.PackageID);
	var pathname = package.Name + "::" + anElement.Name;
	do {
		package = Repository.GetPackageByID(package.ParentID);
		pathname = package.Name + "::" + pathname;
	} while (package.ParentID != 0)
	return pathname;
}

/**
 * @return {Array<EA.Element>} parent elements of the given element; the immediate parent is the first element in the array
 */
function getParents(element) {
	// See Local Scripts.EAConstants-JScript for variable rsParents
	// Behaviour of GetRelationSet seems to be that the immediate parent is the first element in the array.
	elementIdsCommaSeparated = element.GetRelationSet(rsParents);
	var elements;
	if (elementIdsCommaSeparated.length == 0) {
		elements = new Array();
	} else {
		var elementIdsArray = elementIdsCommaSeparated.split(",");
		elements = new Array(elementIdsArray.length);
		for (var i in elementIdsArray) {
			elements[i] = Repository.GetElementByID(elementIdsArray[i]);
		}
	}
	return elements;
}

/**
 * @return {Map<int,EA.ConnectorEnd>} map of the properties of the given element that are not inherited and that are association ends (not attributes)
 *         The key is the connector ID, the value is the connector end.
 */
function getNonInHeritedPropertiesThatAreAssociationEnds(element) {
	var properties = new Map();
	for (var i = 0; i < element.Connectors.Count; i++) {
		connector = element.Connectors.GetAt(i);
		if (connector.Type == "Association" || connector.Type == "Aggregation") {
			var property as EA.ConnectorEnd;
			var isOutgoing = false;
			if (element.ElementID == connector.ClientID && connector.SupplierEnd.IsNavigable) {
				isOutgoing = true;
				property = connector.SupplierEnd;
			} else if (element.ElementID == connector.SupplierID && connector.ClientEnd.IsNavigable) {
				isOutgoing = true;
				property = connector.ClientEnd;
			}
			if (isOutgoing) {
				properties.set(connector.ConnectorID, property);
			}
		}
	}
	return properties;
}
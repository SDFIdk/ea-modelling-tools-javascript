!INC eamt-utilities._guid-utils
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var TAG_NAME_TRANSLITERATED_NAME = "transliteratedName";

var LOGLEVEL = LOGLEVEL_INFO;


/**
 * Transliterates the Danish characters and the letter e with acute to 
 * [Basic Latin](https://unicode-table.com/en/blocks/basic-latin/) characters
 * for all model elements, and puts the transliterated name in tagged value
 * `transliteratedName`. Enumeration literals are not transliterated, and if
 * an enumeration literal has that tagged value, it is removed.
 *
 * - ø → oe
 * - æ → ae
 * - å → aa
 * - é → e
 *
 * @summary Transliterates the names of the model elements.
 */
function main() {
	// Show the script output window
	Repository.EnsureOutputVisible("Script");

	// Get the currently selected package in the tree to work on
	var aPackage as EA.Package;
	aPackage = Repository.GetTreeSelectedPackage();

	LOGInfo("=======================================");

	if (aPackage != null && aPackage.ParentID != 0) {
		LOGInfo("Working on package '" + aPackage.Name + "' (ID=" + aPackage.PackageID + ")");

		var elements as EA.Collection;
		var currentElement as EA.Element;
		var elements = getElementsOfPackageAndSubpackages(aPackage);
		for (var i = 0; i < elements.length; i++) {
			currentElement = elements[i];
			if (currentElement.Type == "Class" || currentElement.Type == "DataType") {
				transliterateNameAndUpdateTaggedValueElement(currentElement);

				var attributes as EA.Collection;
				attributes = currentElement.Attributes;
				for (var j = 0; j < attributes.Count; j++) {
					var currentAttribute as EA.Attribute;
					currentAttribute = attributes.GetAt(j);
					transliterateNameAndUpdateTaggedValueAttribute(currentAttribute);
				}

				var connectors as EA.Collection;
				connectors = currentElement.Connectors;
				for (var j = 0; j < connectors.Count; j++) {
					var currentConnector as EA.Connector;
					currentConnector = connectors.GetAt(j);
					var proceed = isConnectorAssociationAndControlledInSamePackageAsElement(currentConnector, currentElement);
					if (proceed) {
						transliterateNameAndUpdateTaggedValueConnectorEnd(currentConnector, true);
						transliterateNameAndUpdateTaggedValueConnectorEnd(currentConnector, false);
					}
				}
			} else if (currentElement.Type == "Enumeration") {
				transliterateNameAndUpdateTaggedValueElement(currentElement);
				/*
				 * next lines of code: update models that actually contain transliterated names for enumeration values, from earlier modelling
				 */
				var attributes as EA.Collection;
				attributes = currentElement.Attributes;
				for (var j = 0; j < attributes.Count; j++) {
					removeTaggedValueIfPresent(attributes.GetAt(j));
				}
			}
		}
		LOGInfo("Done!");
	} else {
		LOGError(MESSAGE_PACKAGE_REQUIRED);
	}
}

/**
 * @param element {EA.Element}
 */
function transliterateNameAndUpdateTaggedValueElement(element) {
	LOGDebug("Element: " + element.Name);
	if (mustBeTransliterated(element.Name)) {
		var transliteratedName = transliterate(element.Name);
		setTaggedValueElement(element, TAG_NAME_TRANSLITERATED_NAME, transliteratedName);
		LOGInfo("Transliterated name: " + transliteratedName + " of element " + element.Name);
	} else {
		removeTaggedValueIfPresent(element);
	}
}

/**
 * @param element {EA.Attribute}
 */
function transliterateNameAndUpdateTaggedValueAttribute(attribute) {
	LOGDebug("Attribute: " + attribute.Name);
	if (mustBeTransliterated(attribute.Name)) {
		var transliteratedName = transliterate(attribute.Name);
		setTaggedValueAttribute(attribute, TAG_NAME_TRANSLITERATED_NAME, transliteratedName);
		LOGInfo("Transliterated name: " + transliteratedName + " of attribute " + attribute.Name);
	} else {
		removeTaggedValueIfPresent(attribute);
	}
}

/**
 * @param connector {EA.Connector}
 * @param source {boolean}
 */
function transliterateNameAndUpdateTaggedValueConnectorEnd(connector, source) {
	var roleName = null;
	if (source) {
		roleName = connector.ClientEnd.Role;
	} else {
		roleName = connector.SupplierEnd.Role;
	}
	LOGDebug("Connector end role: " + roleName);
	if (mustBeTransliterated(roleName)) {
		var transliteratedName = transliterate(roleName);
		setTaggedValueConnectorEnd(connector, TAG_NAME_TRANSLITERATED_NAME, transliteratedName, source);
		LOGInfo("Transliterated name: " + transliteratedName + " of connector end " + roleName);
	} else {
		removeTaggedValueConnectorEndIfPresent(connector, source);
	}
}

/**
 * @param name {string}
 * @return boolean
 */
function mustBeTransliterated(name) {
	return name.search(/æ|ø|å|é/i) != -1;
}

/**
 * @param name {string}
 * @return {string}
 */
function transliterate(name) {
	return name.replace(/æ/g, "ae").replace(/Æ/g, "Ae").replace(/ø/g, "oe").replace(/Ø/g, "Oe").replace(/å/g, "aa").replace(/Å/g, "Aa").replace(/é/g, "e").replace(/É/g, "E");
}

/**
 * @param object {EA.Element or EA.Attribute}
 */
function removeTaggedValueIfPresent(object) {
	for (var i = 0; i < object.TaggedValues.Count; i++) {
		var tag = object.TaggedValues.GetAt(i);
		if (tag.Name == TAG_NAME_TRANSLITERATED_NAME) {
			object.TaggedValues.DeleteAt(i, true);
		}
	}
	object.TaggedValues.Refresh();
}

/**
 * @param connector {EA.Connector}
 * @param source {boolean}
 */
function removeTaggedValueConnectorEndIfPresent(connector, source /* boolean, false => target */ ) {
	var taggedValues as EA.Collection;
	if (source) {
		taggedValues = connector.ClientEnd.TaggedValues;
	} else {
		taggedValues = connector.SupplierEnd.TaggedValues;
	}
	for (var i = 0; i < taggedValues.Count; i++) {
		var tag = taggedValues.GetAt(i);
		if (tag.Tag == TAG_NAME_TRANSLITERATED_NAME) {
			taggedValues.DeleteAt(i, true);
		}
	}
	taggedValues.Refresh();
}

main();
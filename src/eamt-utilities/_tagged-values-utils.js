/**
 * @file This file contains utility functions to assist with the getting and setting of tagged values.
 *       See also https://www.sparxsystems.com/search/sphider/search.php?query=automation+memo+tagged+value&type=and&category=User+Guide+Latest&tab=5&search=1.
 *
 */
var MAX_LENGTH_TAGGED_VALUE = 255;

/*
 * Do not use Collection.GetByName for searching for tagged values: documentation "If the collection contains items, but it was unable to 
 * find an object with the specified name, the method raises an exception" (note: the exception is Index out of bounds).
 */

/**
 * @param theElement {EA.Element}
 * @param taggedValueName {string}
 * @param defaultValue {string}
 * @return {string}
 */
function getTaggedValueElement(theElement, taggedValueName, defaultValue) {
	var result = defaultValue;

	if (theElement != null && taggedValueName.length > 0) {
		var taggedValue as EA.TaggedValue;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = theElement.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue != null) {
			if (taggedValue.Value == "<memo>") {
				result = taggedValue.Notes;
			} else {
				result = taggedValue.Value;
			}
		}
	}

	return result;
}

/**
 * @param theElement {EA.Element}
 * @param taggedValueName {string}
 * @param taggedValueValue {string}
 */
function setTaggedValueElement(theElement, taggedValueName, taggedValueValue) {
	if (theElement != null && taggedValueName.length > 0) {
		var taggedValue as EA.TaggedValue;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = theElement.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			taggedValue = theElement.TaggedValues.AddNew(taggedValueName, truncateTaggedValueValueIfNeeded(taggedValueValue));

		} else {
			if (taggedValue.Value == "<memo>") {
				taggedValue.Notes = taggedValueValue;
			} else {
				taggedValue.Value = truncateTaggedValueValueIfNeeded(taggedValueValue);
			}
		}
		taggedValue.Update();
		theElement.TaggedValues.Refresh();
	}
}

/**
 * @param theElement {EA.Element}
 * @param taggedValueName {string}
 * @return {boolean}
 */
function hasElementTaggedValue(element, taggedValueName) {
	if (theElement != null && taggedValueName.length > 0) {
		var taggedValue as EA.TaggedValue;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = theElement.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			return false;
		} else {
			return true;
		}
	}
}

/**
 * @param theElement {EA.Element}
 * @param taggedValueName {string}
 */
function changeTaggedValueElementFromSingleLineToMultiLine(theElement, taggedValueName) {
	if (theElement != null && taggedValueName.length > 0) {
		var taggedValue as EA.TaggedValue;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = theElement.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue != null) {
			if (taggedValue.Value == "<memo>") {
				// do nothing
			} else {
				var taggedValueValue = taggedValue.Value;
				taggedValue.Value = "<memo>";
				taggedValue.Notes = taggedValueValue;
				taggedValue.Update();
				theElement.TaggedValues.Refresh();
			}
		}
	}
}

/**
 * Adds a new tagged value with the given name and value to the element. If the tagged
 * value already exist, it is not updated.
 *
 * @param theElement {EA.Element}
 * @param taggedValueName {string}
 * @param taggedValueValue {string}
 */
function addTaggedValueToElement(theElement, taggedValueName, taggedValueValue) {
	if (theElement != null && taggedValueName.length > 0) {
		var taggedValue as EA.TaggedValue;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = theElement.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			taggedValue = theElement.TaggedValues.AddNew(taggedValueName, truncateTaggedValueValueIfNeeded(taggedValueValue));

		} else {
			LOGDebug("Tagged value " + taggedValueName + " is already present on " + theElement.Name);
		}
		taggedValue.Update();
		theElement.TaggedValues.Refresh();
	}
}

/**
 * @param theElement {EA.Element}
 * @param taggedValueName {string}
 */
function deleteTaggedValueElement(theElement, taggedValueName) {
	if (theElement != null && taggedValueName.length > 0) {
		var taggedValue as EA.TaggedValue;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = theElement.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValues.Delete(i);
				break;
			}
		}
		theElement.TaggedValues.Refresh();
	}
}

/**
 * @param attribute {EA.Attribute}
 * @param taggedValueName {string}
 * @param defaultValue {string}
 * @return {string}
 */
function getTaggedValueAttribute(attribute, taggedValueName, defaultValue) {
	var result = defaultValue;

	if (attribute != null && taggedValueName.length > 0) {
		var taggedValue as EA.AttributeTag;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = attribute.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue != null) {
			if (taggedValue.Value == "<memo>") {
				result = taggedValue.Notes;
			} else {
				result = taggedValue.Value;
			}
		}
	}
	return result;
}

/**
 * @param attribute {EA.Attribute}
 * @param taggedValueName {string}
 * @param taggedValueValue {string}
 */
function setTaggedValueAttribute(attribute, taggedValueName, taggedValueValue) {
	if (attribute != null && taggedValueName.length > 0) {
		var taggedValue as EA.AttributeTag;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = attribute.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			taggedValue = attribute.TaggedValues.AddNew(taggedValueName, truncateTaggedValueValueIfNeeded(taggedValueValue));
		} else {
			if (taggedValue.Value == "<memo>") {
				taggedValue.Notes = taggedValueValue;
			} else {
				taggedValue.Value = truncateTaggedValueValueIfNeeded(taggedValueValue);
			}
		}
		taggedValue.Update();
		attribute.TaggedValues.Refresh();
	}
}

/**
 * @param attribute {EA.Attribute}
 * @param taggedValueName {string}
 * @return {boolean}
 */
function hasAttributeTaggedValue(attribute, taggedValueName) {
	if (attribute != null && taggedValueName.length > 0) {
		var taggedValue as EA.AttributeTag;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = attribute.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			return false;
		} else {
			return true;
		}
	}
}

/**
 * @param attribute {EA.Attribute}
 * @param taggedValueName {string}
 */
function changeTaggedValueAttributeFromSingleLineToMultiLine(attribute, taggedValueName) {
	if (attribute != null && taggedValueName.length > 0) {
		var taggedValue as EA.AttributeTag;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = attribute.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue != null) {
			if (taggedValue.Value == "<memo>") {
				// do nothing
			} else {
				var taggedValueValue = taggedValue.Value;
				taggedValue.Value = "<memo>";
				taggedValue.Notes = taggedValueValue;
				taggedValue.Update();
				attribute.TaggedValues.Refresh();
			}
		}
	}
}

/**
 * Adds a new tagged value with the given name and value to the attribute. If the tagged
 * value already exist, it is not updated.
 *
 * @param attribute {EA.Attribute}
 * @param taggedValueName {string}
 * @param taggedValueValue {string}
 */
function addTaggedValueToAttribute(attribute, taggedValueName, taggedValueValue) {
	if (attribute != null && taggedValueName.length > 0) {
		var taggedValue as EA.AttributeTag;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = attribute.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			taggedValue = attribute.TaggedValues.AddNew(taggedValueName, truncateTaggedValueValueIfNeeded(taggedValueValue));
		} else {
			if (taggedValue.Value == "<memo>") {
				taggedValue.Notes = taggedValueValue;
			} else {
				LOGDebug("Tagged value " + taggedValueName + " is already present on " + attribute.Name);
			}
		}
		taggedValue.Update();
		attribute.TaggedValues.Refresh();
	}
}

/**
 * @param attribute {EA.Attribute}
 * @param taggedValueName {string}
 */
function deleteTaggedValueAttribute(attribute, taggedValueName) {
	if (attribute != null && taggedValueName.length > 0) {
		var taggedValue as EA.AttributeTag;
		var taggedValues as EA.Collection;

		taggedValue = null;
		taggedValues = attribute.TaggedValues;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Name == taggedValueName) {
				taggedValues.Delete(i);
				break;
			}
		}

		attribute.TaggedValues.Refresh();
	}
}

/**
 * @param connector {EA.Connector}
 * @param taggedValueName {string}
 * @param source {boolean}
 * @param defaultValue {string}
 * @return {string}
 */
function getTaggedValueConnectorEnd(connector, taggedValueName, source, defaultValue) {
	var result = defaultValue;
	if (connector != null && taggedValueName.length > 0) {
		var taggedValues as EA.Collection;
		var taggedValue as EA.RoleTag;
		if (source) {
			taggedValues = connector.ClientEnd.TaggedValues;
		} else {
			taggedValues = connector.SupplierEnd.TaggedValues;
		}
		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Tag == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}
		if (taggedValue != null) {
			if (taggedValue.Value.substring(0, 6) == "<memo>") {
				result = taggedValue.Value.substring(16); // the following is removed from the start of the value: <memo>$ea_notes=
			} else {
				result = taggedValue.Value.split("$ea_notes=")[0];
			}
		}
	}
	return result;
}

/**
 * @param connectorEnd {EA.ConnectorEnd}
 * @param taggedValueName {string}
 * @param defaultValue {string}
 * @return {string}
 */
function getTaggedValueConnectorEndByConnectorEnd(connectorEnd, taggedValueName, defaultValue) {
	var result = defaultValue;
	if (taggedValueName.length > 0) {
		var taggedValues as EA.Collection;
		var taggedValue as EA.RoleTag;
		taggedValues = connectorEnd.TaggedValues;
		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Tag == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}
		if (taggedValue != null) {
			if (taggedValue.Value.substring(0, 6) == "<memo>") {
				result = taggedValue.Value.substring(16); // the following is removed from the start of the value: <memo>$ea_notes=
			} else {
				result = taggedValue.Value.split("$ea_notes=")[0];
			}
		}
	}
	return result;
}

/**
 * @param connector {EA.Connector}
 * @param taggedValueName {string}
 * @param taggedValueValue {string}
 * @param source {boolean}
 */
function setTaggedValueConnectorEnd(connector, taggedValueName, taggedValueValue, source) {
	if (connector != null && taggedValueName.length > 0) {
		var taggedValues as EA.Collection;
		if (source) {
			taggedValues = connector.ClientEnd.TaggedValues;
		} else {
			taggedValues = connector.SupplierEnd.TaggedValues;
		}

		var taggedValue as EA.RoleTag;
		taggedValue = null;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Tag == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			taggedValue = taggedValues.AddNew(taggedValueName, truncateTaggedValueValueIfNeeded(taggedValueValue));
		} else {
			if (taggedValue.Value.substring(0, 6) == "<memo>") {
				taggedValue.Value = "<memo>$ea_notes=" + taggedValueValue;
			} else {
				taggedValue.Value = truncateTaggedValueValueIfNeeded(taggedValueValue);
			}
		}
		taggedValue.Update();
		taggedValues.Refresh();
	}
}

/**
 * @param connector {EA.Connector}
 * @param taggedValueName {string}
 * @param source {boolean}
 * @return {boolean}
 */
function hasConnectorEndTaggedValue(connector, taggedValueName, source) {
	var result = defaultValue;
	if (connector != null && taggedValueName.length > 0) {
		var taggedValues as EA.Collection;
		var taggedValue as EA.RoleTag;
		if (source) {
			taggedValues = connector.ClientEnd.TaggedValues;
		} else {
			taggedValues = connector.SupplierEnd.TaggedValues;
		}
		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Tag == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}
		if (taggedValue = null) {
			return false;
		} else {
			return true;
		}
	}
}

/**
 * @param connector {EA.Connector}
 * @param taggedValueName {string}
 * @param source {boolean}
 */
function changeTaggedValueConnectorEndFromSingleLineToMultiLine(connector, taggedValueName, source) {
	if (connector != null && taggedValueName.length > 0) {
		var taggedValues as EA.Collection;
		if (source) {
			taggedValues = connector.ClientEnd.TaggedValues;
		} else {
			taggedValues = connector.SupplierEnd.TaggedValues;
		}

		var taggedValue as EA.RoleTag;
		taggedValue = null;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Tag == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue != null) {
			if (taggedValue.Value.substring(0, 6) == "<memo>") {
				// do nothing
			} else {
				var taggedValueValue = taggedValue.Value;
				taggedValue.Value = "<memo>$ea_notes=" + taggedValueValue;
				taggedValue.Update();
				taggedValues.Refresh();
			}
		}
	}
}

/**
 * Adds a new tagged value with the given name and value to the source or target
 * of te given connector. If the tagged value already exist, it is not updated.
 *
 * @param connector {EA.Connector}
 * @param taggedValueName {string}
 * @param taggedValueValue {string}
 * @param source {boolean}
 */
function addTaggedValueToConnectorEnd(connector, taggedValueName, taggedValueValue, source) {
	if (connector != null && taggedValueName.length > 0) {
		var taggedValues as EA.Collection;
		if (source) {
			taggedValues = connector.ClientEnd.TaggedValues;
		} else {
			taggedValues = connector.SupplierEnd.TaggedValues;
		}

		var taggedValue as EA.RoleTag;
		taggedValue = null;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Tag == taggedValueName) {
				taggedValue = taggedValues.GetAt(i);
				break;
			}
		}

		if (taggedValue == null) {
			taggedValue = taggedValues.AddNew(taggedValueName, truncateTaggedValueValueIfNeeded(taggedValueValue));
		} else {
			LOGDebug("Tagged value " + taggedValueName + " is already present on the " + (source ? "source" : "target") + " end of " + connector.Name);
		}
		taggedValue.Update();
		taggedValues.Refresh();
	}
}

/**
 * @param connector {EA.Connector}
 * @param taggedValueName {string}
 * @param source {boolean}
 */
function deleteTaggedValueConnectorEnd(connector, taggedValueName, source) {
	if (connector != null && taggedValueName.length > 0) {
		var taggedValues as EA.Collection;
		if (source) {
			taggedValues = connector.ClientEnd.TaggedValues;
		} else {
			taggedValues = connector.SupplierEnd.TaggedValues;
		}

		var taggedValue as EA.RoleTag;
		taggedValue = null;

		for (var i = 0; i < taggedValues.Count; i++) {
			if (taggedValues.GetAt(i).Tag == taggedValueName) {
				taggedValues.Delete(i);
				break;
			}
		}

		taggedValues.Refresh();
	}
}

/**
 * Truncates the value of a tagged value if it is longer than the maximum.
 *
 * When using a longer value than the maximum, the value cannot be set in the database. EA doesn't show a message
 * but file %appdata%\Sparx Systems\EA\DBError.txt will contain the following:
 * The field is too small to accept the amount of data you attempted to add.  Try inserting or pasting less data.
 *
 * Note that the above was true for eap(x) files. It seems that this does not occur anymore for qea (SQLite) files.
 *
 * @param taggedValueValue {string}
 * @return {string} truncated value
 */
function truncateTaggedValueValueIfNeeded(taggedValueValue) {
	var newTaggedValueValue;
	if (taggedValueValue.length <= MAX_LENGTH_TAGGED_VALUE) {
		newTaggedValueValue = taggedValueValue;
	} else {
		LOGDebug("Truncate to " + MAX_LENGTH_TAGGED_VALUE + " characters: " + taggedValueValue.substring(0, 30) + "...");
		newTaggedValueValue = taggedValueValue.substring(0, MAX_LENGTH_TAGGED_VALUE);
	}
	return newTaggedValueValue;
}
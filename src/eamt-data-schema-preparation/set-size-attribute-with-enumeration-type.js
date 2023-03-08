!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages
!INC eamt-utilities._model-utils
!INC eamt-utilities._tagged-values-utils

var oneByteCodes = [
	' ', '!', '"', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
	':', ';', '<', '=', '>', '?', '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
	'[', ']', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' {', '|', '}'
];
var twoByteCodes = [
	'É'
];
var threeByteCodes = [
	'æ', 'Æ', 'ø', 'Ø', 'å', 'Å', 'é'
];

var promptResult;

/**
 * Sets the size tag of attributes based on the length of the enumeration literals 
 * of the enumeration that is the attributes' type.
 *
 * You can choose whether to calculate the length in bytes (for Oracle) or
 * in characters.
 *
 * Note that the size of characters in a database depends on the character set of 
 * the database. This scripts can be used for an Oracle database with 
 * character set AL32UTF8.
 *
 * See https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/
 * and https://docs.oracle.com/search/?q=al32utf8.
 *
 * @summary Sets the size tag of attributes based on their enumeration
 */
function main() {
	var selectedPackage as EA.Package;
	Repository.EnsureOutputVisible("Script");
	selectedPackage = Repository.GetTreeSelectedPackage();

	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		LOGInfo("CHG Set tagged value size from enumeration in " + selectedPackage.Name);

		promptResult = Session.Prompt("Yes: Calculate length in bytes (Oracle)\r\nNo: Calculate length in characters", promptYESNO);

		setTaggedValues(selectedPackage);

		var packages as EA.Collection;
		var subpackage as EA.Package;
		var packages = getSubpackagesOfPackage(selectedPackage);
		for (var i = 0; i < packages.length; i++) {
			subpackage = packages[i];
			setTaggedValues(subpackage);
		}
		LOGInfo("Done.");
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

function setTaggedValues(aPackage) {
	var elements as EA.Collection;
	var currentElement as EA.Element;
	var attributes as EA.Collection;
	var attribute as EA.Attribute;

	if (aPackage != null) {
		elements = aPackage.Elements;

		LOGInfo("Number of elements: " + elements.Count);
		for (var i = 0; i < elements.Count; i++) {
			currentElement = elements.GetAt(i);
			if (currentElement.Type == "Class" || currentElement.Type == "DataType") {
				LOGInfo("Elementname: " + currentElement.Name);

				attributes = currentElement.Attributes;
				for (var j = 0; j < attributes.Count; j++) {
					attribute = attributes.GetAt(j);
					LOGInfo("attributename: " + attribute.Name);
					if (attribute.ClassifierID == null || attribute.ClassifierID == 0) {
						LOGWarning("Attribute " + attribute.Name +
							" is not linked to a type, this must be fixed. Skipping this attribute.");
					} else {
						var attributeElement as EA.Element;
						attributeElement = Repository.GetElementByID(attribute.ClassifierID);
						if (attributeElement == null) {
							LOGWarning("Could not find an element with id " + attribute.ClassifierID +
								", skipping " + attributeElement.Name);
						} else if (attributeElement.Type == "Enumeration") {
								var attMaxLength = findMaxSize(attributeElement);
								LOGInfo("  Attribute name: " + attribute.Name);
								LOGInfo("  Attribute max length: " + attMaxLength);
								setTaggedValueAttribute(attribute, "size", String(attMaxLength));
						} else {
							LOGDebug(attribute.Name + " has " + attributeElement.Name +
								" as type, which is not an enumeration, skipping it.");
						}
					}
				}
			}
		}
	}
}

function findMaxSize(attributeElement) {
	var attributes as EA.Collection;
	var attribute as EA.Attribute;
	var attMaxLength = 0;

	attributes = attributeElement.Attributes;
	for (var k = 0; k < attributes.Count; k++) {
		attribute = attributes.GetAt(k);
		var enumSize = findEnumSize(attribute.Name);
		if (enumSize > attMaxLength) {
			attMaxLength = enumSize;
		}
	}

	return attMaxLength;
}

function findEnumSize(enumValue) {
	var enumLength;
	switch (promptResult) {
		case resultYes:
			enumLength = 0;
			for (var j = 0; j < enumValue.length; j++) {
				var charToTest = enumValue.substring(j, j + 1);
				if (oneByteCodes.includes(charToTest)) {
					enumLength = enumLength + 1;
				} else if (twoByteCodes.includes(charToTest)) {
					enumLength = enumLength + 2;
				} else if (threeByteCodes.includes(charToTest)) {
					enumLength = enumLength + 3;
				} else {
					enumLength = enumLength + 6;
				}
			}
			break;
		case resultNo:
			enumLength = enumValue.length;
			break;
		default:
			throw new Error("No valid result from the prompt that was displayed earlier");
	}
	LOGDebug("Length of " + enumValue + ": " + enumLength);
	return enumLength;
}

main();
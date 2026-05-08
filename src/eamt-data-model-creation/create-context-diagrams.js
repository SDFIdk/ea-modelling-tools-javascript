!INC eamt-utilities._constants
!INC eamt-utilities._messages
!INC eamt-utilities._logging-utils
!INC eamt-utilities._model-utils

var FQ_STEREOTYPE_RELEVANT_CLASSIFIER = "Grunddata2::DKObjekttype";
var DIAGRAM_NAME_PREFIX = "Kontekstdiagram ";
var DIAGRAM_TYPE = "Grunddatadiagrammer::Objekttypediagram";

/**
 * Creates a context diagram for the classifiers that must have a context diagram
 * The diagram is auto-layouted but should be further refined afterwards.
 *
 * @summary Create context diagrams in a model.
 */
function main() {
	Repository.EnsureOutputVisible("Script");

	var selectedPackage as EA.Package;
	selectedPackage = Repository.GetTreeSelectedPackage();
	
	LOGInfo("=======================================");
	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		LOGInfo("Working on package '" + selectedPackage.Name + "' (ID=" + selectedPackage.PackageID + ").");
        createContextDiagrams(selectedPackage);
		LOGInfo("Done");
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

function createContextDiagrams(pkg) {
    var diagrams = getDiagramsOfPackageAndSubpackages(pkg);
    var elements = getElementsOfPackageAndSubpackages(pkg);

    for (var i = 0; i < elements.length; i++) {
        var element as EA.Element;
		element = elements[i];

        if (element.FQStereotype != FQ_STEREOTYPE_RELEVANT_CLASSIFIER) {
			LOGDebug("Skip " + element.Name);
            continue;
        }
		
		LOGDebug("Found " + element.Name);
        var diagramName   = DIAGRAM_NAME_PREFIX + element.Name;
        var diagramExists = false;
		for (var d of diagrams) {
			if (d.Name === diagramName) {
				diagramExists = true;
				break;
			}
		}

        if (diagramExists) {
			LOGInfo(diagramName + " already exists");
            continue;
        }

        var elementPkg = Repository.GetPackageByID(element.PackageID);
        var diagram as EA.Diagram;
		diagram	= elementPkg.Diagrams.AddNew(diagramName, DIAGRAM_TYPE);
		diagram.Author = elementPkg.Element.Author;
		diagram.Version = elementPkg.Version;

        if (!diagram.Update()) {
            LOGWarn("Could not create diagram '" + diagram.Name + "': " + diagram.GetLastError());
            continue;
        }
		
		var diagramObjects as EA.Collection;
		diagramObjects = diagram.DiagramObjects;
		addElementToDiagramObjects(diagramObjects, element);
		var layoutDirection = lsLayoutDirectionRight;
		var parents = getParents(element);
		if (parents.length >= 1) {
			layoutDirection = lsLayoutDirectionUp;
		}
		for (var p of parents) {
			addElementToDiagramObjects(diagramObjects, p);
		}
		addTypesOfPropertiesIfRelevant(element, elements, diagramObjects);
		
		autoLayoutDiagram(diagram, layoutDirection);
		
        LOGInfo("Created diagram '" + diagramName + "' in package '" + elementPkg.Name + "'");
	}
}

function addTypesOfPropertiesIfRelevant(element, elementsInModel, diagramObjects) {
	/*
	 * Add elements that are the type of an association end of the central classifier.
	 */
	for (connectorId of getNonInHeritedPropertiesThatAreAssociationEnds(element).keys()) {
		var connector as EA.Connector;
		connector = Repository.GetConnectorByID(connectorId);
		if (connector.SupplierID == element.ElementID) {
			addElementToDiagramObjects(diagramObjects, Repository.GetElementByID(connector.ClientID));
		} else {
			addElementToDiagramObjects(diagramObjects, Repository.GetElementByID(connector.SupplierID));
		}
	}

	/*
	 * Add elements that are the type of one of the attributes of the central classifier
	 * and that are defined in the same model as the central classifier to the diagram too.
	 */
	var attributes = element.Attributes;
	for (var j = 0; j < attributes.Count; j++) {
		var attribute as EA.Attribute;
		attribute = attributes.GetAt(j);
		var typeId = attribute.ClassifierID;
		if (typeId != 0) {
			for (var e of elementsInModel) {
				if (typeId == e.ElementID) {
					addElementToDiagramObjects(diagramObjects, Repository.GetElementByID(typeId));
					break;
				}
			}
		}
	}
}

function addElementToDiagramObjects(diagramObjects, element) {
	var diagramObject as EA.DiagramObject;
	diagramObject = diagramObjects.AddNew("", "");
	diagramObject.ElementID = element.ElementID;
	diagramObject.Update();
	return diagramObject;
}

function autoLayoutDiagram(diagram, layoutDirection) {
	var pi = Repository.GetProjectInterface();
	/* 	layoutStyle is a bit field - a single integer where different groups of bits
		encode different layout options. Use bitwise OR (|) to combine one value from
		each category. See: https://en.wikipedia.org/wiki/Bit_field */
	var layoutStyle = lsCycleRemoveDFS
	  | lsLayeringOptimalLinkLength
	  | lsInitializeDFSIn
	  | lsCrossReduceAggressive
	  | layoutDirection;
	pi.LayoutDiagramEx(
		pi.GUIDtoXML(diagram.DiagramGUID),
		layoutStyle,
		4,      // no of iterations
		60,     // layer spacing — vertical gap between class rows
		40,     // column spacing — horizontal gap between classes
		false   // don't overwrite diagram's saved defaults
	);
}

main();
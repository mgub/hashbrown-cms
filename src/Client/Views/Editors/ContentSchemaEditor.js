'use strict';

const SchemaEditor = require('Client/Views/Editors/SchemaEditor');

/**
 * The editor for Content Schemas
 *
 * @memberof HashBrown.Client.Views.Editors
 */
class ContentSchemaEditor extends SchemaEditor {
    /**
     * Renders the editor fields
     */
    renderFields() {
        let $element = super.renderFields();

        // Default tab
        $element.append(this.renderField('Default tab', new HashBrown.Views.Widgets.Dropdown({
            options: this.compiledSchema.tabs,
            value: this.model.defaultTabId,
            useClearButton: true,
            onChange: (newValue) => {
                this.model.defaultTabId = newValue;
            }
        }).$element));
        
        // Tabs
        $element.append(this.renderField('Tabs', this.renderTabsEditor()));
        
        // Allowed child Schemas
        $element.append(this.renderField('Allowed child Schemas', new HashBrown.Views.Widgets.Dropdown({
            options: HashBrown.Helpers.SchemaHelper.getAllSchemasSync('content'),
            value: this.model.allowedChildSchemas,
            labelKey: 'name',
            valueKey: 'id',
            useMultiple: true,
            useClearButton: true,
            useTypeAhead: true,
            onChange: (newValue) => {
                this.model.allowedChildSchemas = newValue;
            }
        }).$element));
        
        // Field properties
        let $fieldProperties = _.div({class: 'editor__field'});
        
        $element.append($fieldProperties);

        let renderFieldProperties = () => {
            _.append($fieldProperties.empty(),
                _.div({class: 'editor__field__key'}, 'Properties'),
                _.div({class: 'editor__field__value'},
                    _.each(this.model.fields.properties, (fieldKey, fieldValue) => {
                        let $field = _.div({class: 'editor__field'});

                        let renderField = () => {
                            _.append($field.empty(),
                                _.div({class: 'editor__field__key'},
                                    new HashBrown.Views.Widgets.Input({
                                        type: 'text',
                                        placeholder: 'A variable name, e.g. "myField"',
                                        tooltip: 'The field variable name',
                                        value: fieldKey,
                                        onChange: (newKey) => {
                                            delete this.model.fields.properties[fieldKey];

                                            fieldKey = newKey;

                                            this.model.fields.properties[fieldKey] = fieldValue;
                                        }
                                    }).$element,
                                    new HashBrown.Views.Widgets.Input({
                                        type: 'text',
                                        placeholder: 'A label, e.g. "My field"',
                                        tooltip: 'The field label',
                                        value: fieldValue.label,
                                        onChange: (newValue) => { fieldValue.label = newValue; }
                                    }).$element
                                ),
                                _.div({class: 'editor__field__value'},
                                    _.div({class: 'editor__field'},
                                        _.div({class: 'editor__field__key'}, 'Tab'),
                                        _.div({class: 'editor__field__value'},
                                            new HashBrown.Views.Widgets.Dropdown({
                                                useClearButton: true,
                                                options: this.compiledSchema.tabs,
                                                value: fieldValue.tabId,
                                                onChange: (newValue) => {
                                                    fieldValue.tabId = newValue;
                                                }
                                            }).$element
                                        )
                                    ),
                                    _.div({class: 'editor__field'},
                                        _.div({class: 'editor__field__key'}, 'Schema'),
                                        _.div({class: 'editor__field__value'},
                                            new HashBrown.Views.Widgets.Dropdown({
                                                useTypeAhead: true,
                                                options: HashBrown.Helpers.SchemaHelper.getAllSchemasSync('field'),
                                                value: fieldValue.schemaId,
                                                labelKey: 'name',
                                                valueKey: 'id',
                                                onChange: (newValue) => {
                                                    fieldValue.schemaId = newValue;

                                                    renderField();
                                                }
                                            }).$element
                                        )
                                    ),
                                    _.do(() => {
                                        let schema = HashBrown.Helpers.SchemaHelper.getSchemaByIdSync(fieldValue.schemaId);

                                        if(!schema) { return; }

                                        let editor = HashBrown.Views.Editors.FieldEditors[schema.editorId];

                                        if(!editor) { return; }

                                        fieldValue.config = fieldValue.config || {};

                                        return editor.renderConfigEditor(fieldValue.config);
                                    })
                                )
                            );
                        };

                        renderField();

                        return $field;
                    }),
                    _.button({title: 'Add a property', class: 'widget widget--button round right'},
                        _.span({class: 'fa fa-plus'})
                    ).click(() => {
                        this.model.fields.properties.newField = {
                            label: 'New field',
                            schemaId: 'array'
                        };

                        renderFieldProperties();
                    })
                )
            );
        };

        renderFieldProperties();

        return $element;
    }
}

module.exports = ContentSchemaEditor;

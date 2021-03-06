'use strict';

const RequestHelper = require('Client/Helpers/RequestHelper');
const SettingsHelper = require('Client/Helpers/SettingsHelper');
const ProjectHelper = require('Client/Helpers/ProjectHelper');

/**
 * The sync settings editor
 *
 * @memberof HashBrown.Client.Views.Dashboard
 */
class SyncEditor extends HashBrown.Views.Modals.Modal {
    constructor(params) {
        params.title = 'Sync';
        params.actions = [
            {
                label: 'Apply',
                class: 'btn-primary',
                onClick: () => {
                    this.onClickApply();

                    return false;
                }
            },
            {
                label: 'Save',
                class: 'btn-primary',
                onClick: () => {
                    this.onClickSave();

                    return false;
                }
            }
        ];

        params.autoFetch = false;

        super(params);
        
        this.fetch();
    }
    
    /**
     * Event: Click save. Posts the model to the modelUrl and closes
     */
    onClickSave() {
        this.model.url = this.$element.find('input[name="url"]').val();

        SettingsHelper.setSettings(this.projectId, '', 'sync', this.model)
        .then(() => {
            this.close();

            this.trigger('change', this.model);
        })
        .catch(UI.errorModal);
    }
    
    /**
     * Event: Click apply. Posts the model to the modelUrl
     */
    onClickApply() {
        this.model.url = this.$element.find('input[name="url"]').val();

        SettingsHelper.setSettings(this.projectId, '', 'sync', this.model)
        .then(() => {
            this.trigger('change', this.model);
        })
        .catch(UI.errorModal);
    }
    
    /**
     * Render enabled switch
     */
    renderEnabledSwitch() {
        return new HashBrown.Views.Widgets.Input({
            type: 'checkbox',
            name: 'enabled',
            value: this.model.enabled === true,
            onChange: (newValue) => {
                this.model.enabled = newValue;
            }
        }).$element;
    }

    /**
     * Renders the URL editor
     *
     * @returns {HTMLElement} Element
     */
    renderUrlEditor() {
        return new HashBrown.Views.Widgets.Input({
            name: 'url',
            type: 'text',
            value: this.model.url || '',
            placeholder: 'e.g. "https://myserver.com/api/"'
        }).$element;
    }
    
    /**
     * Renders the project id editor
     *
     * @returns {HTMLElement} Element
     */
    renderProjectIdEditor() {
        return new HashBrown.Views.Widgets.Input({
            name: 'name',
            value: this.model.project,
            onChange: (newValue) => {
                this.model.project = newValue;
            }
        }).$element;
    }
    
    /**
     * Renders the token editor
     *
     * @returns {HTMLElement} Element
     */
    renderTokenEditor() {
        return [
            new HashBrown.Views.Widgets.Input({
                value: this.model.token,
                name: 'token',
                placeholder: 'API token',
                onChange: (newToken) => { this.model.token = newToken; }
            }).$element,
            _.button({class: 'widget widget--button small fa fa-refresh'})
                .on('click', () => {
                    if(!this.model.url) {
                        alert('You need to specify a URL. Please do so and apply the settings first.');
                        return;
                    }
                    
                    let tokenModal = new HashBrown.Views.Modals.Modal({
                        title: 'Refresh token',
                        body: [
                            _.div({class: 'widget-group'},
                                _.label({class: 'widget widget--label'}, 'Username'),
                                _.input({class: 'widget widget--input text', type: 'text'})
                            ),
                            _.div({class: 'widget-group'},
                                _.label({class: 'widget widget--label'}, 'Password'),
                                _.input({class: 'widget widget--input text', type: 'password'})
                            )
                        ],
                        actions: [
                            {
                                label: 'Get token',
                                onClick: () => {
                                    let username = tokenModal.element.querySelector('input[type="text"]').value;
                                    let password = tokenModal.element.querySelector('input[type="password"]').value;
                                    
                                    RequestHelper.request(
                                        'post',
                                        this.projectId + '/sync/login',
                                        {
                                            username: username,
                                            password: password
                                        }
                                    ).then((token) => {
                                        this.model.token = token;
                                        
                                        this.element.querySelector('input[name="token"]').value = token;
                                    })
                                    .catch(UI.errorModal);
                                }
                            }
                        ]
                    });
                })
        ];
    }
    
    /**
     * Renders a single field
     *
     * @param {String} label
     * @param {HTMLElement} $content
     *
     * @return {HTMLElement} Editor element
     */
    renderField(label, $content) {
        return _.div({class: 'widget-group'},
            _.div({class: 'widget widget--label'},
                label
            ),
            $content
        );
    }

    /**
     * Renders the modal body
     *
     * @returns {HTMLElement} Body
     */
    renderBody() {
        return [
            this.renderField('Enabled', this.renderEnabledSwitch()),
            this.renderField('API URL', this.renderUrlEditor()),
            this.renderField('API Token', this.renderTokenEditor()),
            this.renderField('Project id', this.renderProjectIdEditor())
        ];
    }
}

module.exports = SyncEditor;

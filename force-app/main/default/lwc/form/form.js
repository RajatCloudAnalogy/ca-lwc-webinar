import { LightningElement, track } from 'lwc';
import getFormNameById from '@salesforce/apex/FormController.getFormNameById';
import getFormQuestionByFormId from '@salesforce/apex/FormController.getFormQuestionByFormId';
import submitFormResponse from '@salesforce/apex/FormController.submitFormResponse';

export default class Form extends LightningElement {
    formName = 'Form';
    formId;
    questionList = [];
    questionIdVsResponseMap = new Map();
    @track submittedBy = 'Anonymous';
    @track disabledSubmitButton = false;

    async connectedCallback() {
        const currentUrl = new URL(window.location.href).searchParams;
        if (currentUrl.get('id')) {
            this.formId = currentUrl.get('id');
            this.formName = await getFormNameById({formId: this.formId});
            this.prepareQuestionList();
        }
    }

    async prepareQuestionList() {
        const questionList =  await getFormQuestionByFormId({formId: this.formId});
        if (questionList && questionList.length > 0) {
            const tempList = [];
            questionList.forEach(element => {
                element = {...element};
                element.options = [];
                if (element.Options__c) {
                    element.Options__c.split('\n').forEach(choice => {
                        element.options.push({ label: choice, value: choice });
                    });
                }
                tempList.push(element);
            });
            this.questionList = tempList;
        }
    }

    handleChange (e) {
        this.questionIdVsResponseMap.set(e.target.name, {
            Form_Question__c: e.target.name,
            Response__c: e.target.value,
            Form__c: this.formId
        });
    }

    handleSubmittedBy (e) {
        this.submittedBy = e.target.value;
    }

    async handleSubmit (e) {
        const response = await submitFormResponse({
            formResponse: {Answered_By__c : this.submittedBy, Form__c: this.formId},
            questionResponseList: Array.from(this.questionIdVsResponseMap.values())
        });

        if (response) {
            this.disabledSubmitButton = true;
            alert('You have successfully submitted!');
        }
    }
}
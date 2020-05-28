public with sharing class FormController {
    @AuraEnabled(cacheable=true)
    public static string getFormNameById(Id formId){
        return [SELECT Id, Name FROM Form__c WHERE Id = :formId].Name;
    }

    @AuraEnabled(cacheable=true)
    public static List<Form_Question__c> getFormQuestionByFormId(Id formId){
        return [SELECT Id, Name, Question__c, Options__c FROM Form_Question__c WHERE Form__c = :formId];
    }

    @AuraEnabled
    public static Boolean submitFormResponse(Form_Response__c formResponse, List<Form_Question_Response__c> questionResponseList){
        try {
            insert formResponse;
            for (Form_Question_Response__c responseQuestion : questionResponseList) {
                responseQuestion.Form_Response__c = formResponse.Id;
            }
            insert questionResponseList;
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
'use strict'

const constants = require('./constants.js').BUILDBOT
const AWSFactory = require('./aws-factory.js')

function startWorkflow (workflowInputs) {
  return AWSFactory().then((AWS) => {
    return new Promise((resolve, reject) => {
      const assumedRole = workflowInputs.assumedRole
      const signingInfo = workflowInputs.signingInfo
      const userEmail = workflowInputs.userEmail
      const file = workflowInputs.file
      const platform = workflowInputs.platform
      const buildMode = workflowInputs.buildMode

      const SWF = new AWS.SWF(assumedRole)
      const params = {
        domain: constants.DOMAIN,
        workflowId: `workflow-${file}-${Date.now()}`,
        executionStartToCloseTimeout: (1000 * 60 * 60) + '',
        taskStartToCloseTimeout: (1000 * 60 * 60) + '',
        childPolicy: 'REQUEST_CANCEL',
        workflowType: constants.WORKFLOW_TYPES[platform],
        tagList: [platform],
        taskList: {
          name: constants.DECISION_TASKLIST
        },
        input: JSON.stringify({file: file, email: userEmail, signingInfo, buildMode})
      }

      SWF.startWorkflowExecution(params, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}

module.exports = startWorkflow

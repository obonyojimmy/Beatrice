
const remote = require('electron').remote ;
const fs = require('/Users/Parsoa/Desktop/Sharif/Research/Royan/src/Beatrice/app/file/fs_interface.js')
const node_fs = require('fs');
const constants = require('/Users/Parsoa/Desktop/Sharif/Research/Royan/src/Beatrice/app/constants.js')
const commons = require('/Users/Parsoa/Desktop/Sharif/Research/Royan/src/Beatrice/app/common.js')
const yaml = require('js-yaml')

let pipeline = {} ;

let cwl_version = "cwl:draft-3" ;

function export_workspace(pipeline, base_directory) {
	console.log(base_directory) ;
	console.log('Exporting to JSON ... ') ;
	node_fs.writeFileSync(base_directory + '/' + pipeline.name + '.bpl', JSON.stringify(pipeline, null, 2)) ;
}

function export_pipeline(meta, base_directory, head_step) {
	console.log('Exporting ... ') ;
	pipeline['class'] = 'Workflow' ;
	pipeline['cwlVersion'] = cwl_version ;
	pipeline['description'] = meta.description ;
	pipeline['inputs'] = [] ;
	pipeline['outputs'] = [] ;
	pipeline['steps'] = [] ;
	while (head_step != null) {
		pipeline.steps.push({
			id: head_step.name,
			run: './' + head_step.name + '.cwl',
			inputs: head_step.export_inputs(),
			outputs: head_step.export_outputs()
		}) ;
		export_step(head_step, base_directory) ;
		head_step = head_step.next ;
	}
	node_fs.writeFileSync(base_directory + '/pipeline.cwl', yaml.dump(pipeline, {
		'styles': {
			'!!null': 'lowercase' ,
			'!!int': 'decimal' ,
			'!!bool': 'lowercase'
		}
	})) ;
}

function check_base_directory(base_directory) {
	if (!node_fs.existsSync(base_directory)) {
		node_fs.mkdirSync(base_directory) ;
	}
}

function get_pipeline_outputs() {

}

function export_step(step, base_directory) {
	var workflow = step.head_workflow ;
	while (workflow. previous != null) {
		workflow = workflow.previous ;
	}
	var pipeline = {} ;

	pipeline['title'] = step.name ;
	pipeline['cwlVersion'] = cwl_version ;
	pipeline['description'] = step.description ;
	pipeline['inputs'] = step.get_all_inputs() ;
	pipeline['outputs'] = step.get_all_outputs() ;

	var steps = [] ;
	while (workflow != null) {
		var current_step = {} ;
		current_step['id'] = workflow.name ;
		current_step['run'] = './' + workflow.name + '.cwl'
		current_step['inputs'] = workflow.export_inputs() ;
		current_step['outputs'] = workflow.export_outputs() ;
		steps.push(current_step) ;
		workflow = workflow.next ;
	}

	pipeline['steps'] = steps ;

	node_fs.writeFileSync(base_directory + '/' + step.name + '.cwl', yaml.dump(pipeline, {
		'styles': {
			'!!null': 'lowercase' ,
			'!!int': 'decimal' ,
			'!!bool': 'lowercase'
		}
	})) ;

	generate_step_inputs_file(step, base_directory) ;
}

function generate_step_inputs_file(step, base_directory) {
	node_fs.writeFileSync(base_directory + '/' + step.name + '_inputs' + '.json', JSON.stringify(step.get_constant_inputs(), null, 2)) ;
}

exports.export_pipeline = export_pipeline ;
exports.export_workspace = export_workspace ;

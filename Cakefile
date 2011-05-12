{exec} = require 'child_process'

out = 'target/htdocs'

task 'resources', 'copy the resources to target dir', (options) ->
  srd = 'src/main/resources'
  exec "mkdir -p #{out} && cp -rf #{srd}/* #{out}", (err, stdout, stderr) ->
    if err then console.log stderr.trim()

task 'clean', 'clean the output directory', (options) ->
  exec "rm -rf #{out}"

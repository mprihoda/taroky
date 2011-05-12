fs = require 'fs'
{exec} = require 'child_process'

out = 'target'
dest = "#{out}/htdocs"
src = 'src'
main_src = "#{src}/main"
test_src = "#{src}/test"
coffee_src = "#{main_src}/coffee"
js_src = "#{coffee_src}/js"
stylus_src = "#{main_src}/stylus"

coffee_files_in = (dir) -> (file for file in fs.readdirSync dir when file.match(/\.coffee$/))

task 'build', 'build the sources', (options) ->
  invoke 'resources'
  invoke 'build:css'
  invoke 'build:js'
  invoke 'build:html'

task 'build:html', 'build html only', (options) ->
  exec "mkdir -p #{dest}", (err, stdout, stderr) ->
    throw err if err
    for input in coffee_files_in coffee_src
      exec "coffeekup #{coffee_src}/#{input}", (err, stdout, stderr) ->
        if err
          exec "rm #{coffee_src}/*.html", (err2) ->
            throw err
        else
          exec "mv #{coffee_src}/*.html #{dest}", (err) ->
            throw err if err

task 'build:js', 'build javascript only', (options) ->
  tgt = "#{dest}/js"
  exec "mkdir -p #{tgt}", (err, stdout, stderr) ->
    throw err if err
    for input in coffee_files_in js_src
      exec "coffee -c -o #{tgt} #{js_src}/#{input}", (err, stdout, stderr) ->
        throw err if err

task 'build:css', 'build css files only', (options) ->
  tgt = "#{dest}/css"
  exec "mkdir -p #{tgt}", (err, stdout, stderr) ->
    throw err if err
    files = (file for file in fs.readdirSync "#{stylus_src}/css" when file.match(/\.styl$/))
    for input in files
      exec "stylus -o #{tgt} #{stylus_src}/css/#{input}", (err) ->
        throw err if err

task 'resources', 'copy the resources to target dir', (options) ->
  source = "#{main_src}/resources"
  exec "mkdir -p #{dest} && cp -rf #{source}/* #{dest}", (err) ->
    throw err if err

task 'clean', 'clean the output directory', (options) ->
  exec "rm -rf #{dest}", (err) ->
    throw err if err

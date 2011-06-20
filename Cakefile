fs = require 'fs'
util = require 'util'
console = require 'console'
{exec, spawn} = require 'child_process'

out = 'target'
ngout = "#{out}/nginx"
dest = "#{out}/htdocs"
src = 'src'
main_src = "#{src}/main"
test_src = "#{src}/test"
coffee_src = "#{main_src}/coffee"
coffe_test_src="#{test_src}/coffee"
test_resources="#{test_src}/resources"
js_src = "#{coffee_src}/js"
stylus_src = "#{main_src}/stylus"

files_in = (dir, pattern) -> ({name: file, path: "#{dir}/#{file}"} for file in fs.readdirSync dir when file.match(pattern))
coffee_files_in = (dir) -> files_in dir, /\.coffee$/
stylus_files_in = (dir) -> files_in dir, /\.styl$/

paths_of = (files) -> (file.path for file in files)
names_of = (files) -> (file.name for file in files)

copy_resources = (s, d) ->
  exec "mkdir -p #{d} && cp -rf #{s}/* #{d}", (err) ->
    throw err if err

compile_coffee = (s, d) ->
  exec "mkdir -p #{d}", (err, stdout, stderr) ->
    throw err if err
    for input in paths_of coffee_files_in s
      exec "coffee -c -o #{d} #{input}", (err, stdout, stderr) ->
        throw err if err

task 'build', 'build the sources', (options) ->
  invoke 'resources'
  invoke 'build:css'
  invoke 'build:js'
  invoke 'build:html'
  invoke 'tests:build'

task 'watch', 'watch the sources and compile when changed', (options) ->
  invoke 'build'
  scripts = paths_of coffee_files_in js_src
  tests = paths_of coffee_files_in coffe_test_src
  tmpls = paths_of coffee_files_in coffee_src
  styles = paths_of stylus_files_in "#{stylus_src}/css"
  execs = {
    coffee: [
      ["-o", "#{dest}/js", "-w", "-c"].concat(scripts),
      ["-o", "#{out}/tests", "-w", "-c"].concat(tests)
    ]
    coffeekup: [["-o", "#{dest}", "-w"].concat(tmpls)]
    stylus: [["-o", "#{dest}/css", "-w"].concat(styles)]
  }
  children = []
  for exe, args of execs
    for a in args
      x = spawn exe, a
      x.stdout.on 'data', (data) -> process.stdout.write data
      children.push x
  util.log 'Press enter to exit.'
  invoke 'nginx:start'
  process.stdin.resume()
  process.stdin.on 'keypress', (char, key) ->
    util.log "Exiting."
    for ch in children then ch.kill()
    invoke 'nginx:stop'
    process.exit 0

task 'build:html', 'build html only', (options) ->
  exec "mkdir -p #{dest}", (err, stdout, stderr) ->
    throw err if err
    for input in paths_of coffee_files_in coffee_src
      exec "coffeekup -o #{dest} #{input}", (err, stdout, stderr) ->
        throw err if err

task 'build:js', 'build javascript only', (options) ->
  compile_coffee js_src, "#{dest}/js"

task 'build:css', 'build css files only', (options) ->
  tgt = "#{dest}/css"
  exec "mkdir -p #{tgt}", (err, stdout, stderr) ->
    throw err if err
    files = (file for file in stylus_files_in "#{stylus_src}/css")
    for input in paths_of stylus_files_in "#{stylus_src}/css"
      exec "stylus -o #{tgt} #{input}", (err) ->
        throw err if err

task 'resources', 'copy the resources to target dir', (options) ->
  copy_resources "#{main_src}/resources", "#{dest}"

task 'tests:build', 'build the tests', (options) ->
  invoke 'tests:resources'
  invoke 'tests:coffee'

task 'tests:resources', 'copy the test resources', (options) ->
  copy_resources "#{test_src}/resources", "#{out}/tests"

task 'tests:coffee', 'compile the test coffee scripts', (options) ->
  compile_coffee coffe_test_src, "#{out}/tests"

task 'clean', 'clean the output directory', (options) ->
  exec "rm -rf #{out}", (err) ->
    throw err if err

task 'nginx:start', 'run nginx', (options) ->
  exec "mkdir -p #{ngout}", (err, stdout, stderr) ->
    throw err if err
    files = (file for file in fs.readdirSync "#{src}/nginx")
    for file in files
      sed = "sed -e 's,\\$pwd\\$,#{process.cwd()},g'"
      cmd = "cat #{src}/nginx/#{file} | #{sed} > #{ngout}/#{file}"
      exec cmd, (err) -> throw err if err
      # TODO: is this async? Could it trigger a race condition?
    exec "nginx -c #{process.cwd()}/target/nginx/nginx.conf"

task 'nginx:stop', 'stop nginx', (options) ->
  exec 'nginx -s quit', (err) -> throw err if err

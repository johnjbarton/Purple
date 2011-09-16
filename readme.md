Purple is repl++: a parse, re-run, break, loop environment. 
This is an ambitious project currently under development. 
At the present time it is not usable.

Purple combines 
  * semi-automatic tracing,
  * query-point debugging, and
  * incremental, live-image editing
to create a different kind of Web development tool.

Conventional development tools focus on the state of the source (editors, IDEs) or the state of the runtime (debuggers). 
Purple focuses on the stream of events that convert the source into the runtime state. 

Today developers use console.log() or a series of breakpoints to study the effects of source on the end result.
Purple adds logging and breakpoints under the covers to connect results to back to causes.

Logging can overwhelm the developer and dramatically slow down a program; breakpoints can be tedious to set and unset. 
Purple adds logging and breakpoints based on concrete, goal-oriented developer operations.
For example the developer may ask for information on the last time an object property was set 
or all of the operations that altered an HTML element. 
Then Purple re-executes proportions of the code and assembles the log into information for the developer.

Complementing this event-logging debugger, Purple includes incremental editing.
Once we find source causes, Purple's source code editor allows experimental modification to change the effects.
Then when the intended effect has been observed, the changes can be pushed back to the server.

Purple's logging technology uses JavaScript-to-JavaScript compilation with the Traceur compiler:
  * http://code.google.com/p/traceur-compiler/
Purple's editor comes from the Orion project:
  * http://wiki.eclipse.org/Orion
The query-point debugging concepts build on the work of Salman Mirghasemi:
  * http://code.google.com/p/querypoint-debugging/
The low-level events come from the Chrome browser's Web Inspector interoface:
  * http://code.google.com/chrome/devtools/docs/remote-debugging.html
  
Dev Install:

1. Get an account on http://orionhub.org (or install Orion)
2. clone this reprository 
3. Apply these instructions: 
  http://wiki.eclipse.org/Orion/How_Tos/Developing_Chrome_extensions_in_Orion
to purple/chrome/extension directory, but after step 2, unzip the files.
4. Edit the extension file ppa.html to change the purple URL to your repro. You need to change the two letters between '/file/' and '/purple.html'.
5. Load/reload the extension.
6. Right click on a page to see purple in the context menu. 

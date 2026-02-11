 The problem it describes:                                                               
  People use Claude Code lazily - they say "build me a meditation app" and get mediocre   
  results.                                                                                
                                                                                          
  The 3-step fix it recommends:

  1. Use the AskUserQuestion tool first - Copy-paste your project idea as a prompt. This
  triggers Claude to use the AskUserQuestion tool to interrogate you about every technical
   detail, trade-off, and edge case before writing a single line of code.
  2. Break the project into features - Don't say "build me an app." Instead, say "build
  Feature A," test it, then "build Feature B," test it, etc. One piece at a time.
  3. Watch your context window - Even though Claude supports ~200k tokens, it starts
  losing track of your instructions around the 40-50% mark. When that happens, start a new
   conversation and keep building feature by feature.

  TL;DR: Let Claude question you first, build incrementally, and start fresh sessions
  before Claude's memory gets overloaded.

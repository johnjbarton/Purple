

EditorInterface: encapsulates editor impl, documents API
  EditorCompilerAssembly: connects editor and compiler, same API
    EditorDelegator: holds instance of OrionEditor, new API
      OrionEditor: Orion embeddededitor code, minor changes
    Traceur: JS-to-JS compiler
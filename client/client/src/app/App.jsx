import './App.css'
import { Editor } from '@monaco-editor/react'
import { MonacoBinding }  from "y-monaco"
import { useRef, useMemo, useState } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { useEffect } from 'react'

function App() {
  
  const [users, setUsers] = useState([])
  const [editor, setEditor] = useState(null)
  const [username, setUsername] = useState(()=>{
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const editorRef = useRef(null)
  const ydoc = useMemo(() => new Y.Doc(), []) // yDoc store multiple code files and store them in the doc format and with the help of this, YJS checks what changes you made and show those to the other user.
  const yText = useMemo(() => ydoc.getText("moncao"), [ydoc]) // yText is used for getting the context of the file

  const handleMount = (editor)=>{
    setEditor(editor) 
  }

  useEffect(()=>{
    if(username && editor){
      const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc, {
      autoConnect: true
    })
    provider.awareness.setLocalStateField("user", {username})
    
    // setUsers(states.filter(state => state && state.user.username).map(state => state.user))

    provider.awareness.on("change", ()=>{
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state => state && state?.user?.username).map(state => state.user))
    })

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField("user", null)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Moncao binding is helping users to show the changes to the server which will show it to the other user.
    const monacoBinding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    )

    return () => {
      monacoBinding.destroy()
      provider.disconnect()
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }


    }
  },[
    editor,
    username
  ])


  const handleSubmit = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  if(!username){
    return(
      <main className='h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center'>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text"
            placeholder='Enter your username'
            className='p-2 rounded-lg bg-gray-800 text-white'
            name='username'
            // value={username}
            // onChange={(e)=> setUsername(e.target.value)} 
          />
          <button 
            className='p-2 rounded-lg bg-amber-50 text-gray-50 font-bold'
            >Join</button>
        </form>
      </main>
    )
  }



  return (
    <main className='h-screen w-full bg-gray-950 flex gap-4 p-4'>
      <aside className='h-full w-1/4 bg-amber-50 rounded-lg'>
        <h2 className='text-2xl font-bold p-4 border-b border-gray-300'>Users</h2>
        <ul className='p-4'>
          {users.map((user, index) => {
            return (
            <li key={index} className='p-2 bg-gray-800 text-white rounded mb-2'>
              {user.username}
            </li>
            )
          })}
        </ul>
      </aside>
      <section className='w-3/4 bg-neutral-50 overflow-hidden'>
        <Editor height="100%" defaultLanguage='javascript' defaultValue='// some comment' theme='vs-dark' onMount={handleMount}/>
      </section>
    </main>
  )
}

export default App

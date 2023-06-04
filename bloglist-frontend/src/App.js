import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import CreateForm from './components/CreateForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState(null)
  const blogFormRef = useRef()
  
  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])


  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password
      })
      blogService.setToken(user.token)
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      showMessage(exception.response.data.error, "error")
    }
  }

  const handleLogout = async (event) => {
    event.preventDefault()
    try {
      blogService.setToken('')
      window.localStorage.removeItem(
        'loggedBlogappUser'
      )
      setUser(null)
    } catch (exception) {
      console.log(exception)
    }
  }

  const handleCreate = (event) => {
    event.preventDefault()
    try {
      blogService.create({
        title: title,
        author: author,
        url: url
      }).then(returnedBlog => {
        showMessage(`a new blog ${title} by ${author} added`, "notification")
        setBlogs(blogs.concat(returnedBlog))
        setTitle('')
        setAuthor('')
        setUrl('')
      })
      blogFormRef.current.toggleVisibility()
    } catch (exception) {
      showMessage(exception.response.data.error, "error")
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }


  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={message} />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type='text'
              value={username}
              name='username'
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type='text'
              value={password}
              name='password'
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type='submit'>login</button>
        </form>
      </div>
    )
  }
  return (
    <div>
      <h2>blogs</h2>
      <Notification message={message} />
      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>
      <Togglable buttonLabel='new note' ref={blogFormRef}>
        <CreateForm
          handleSubmit={handleCreate}
          title={title}
          handleTitleChange={({ target }) => setTitle(target.value)}
          author={author}
          handleAuthorChange={({ target }) => setAuthor(target.value)}
          url={url}
          handleUrlChange={({ target }) => setUrl(target.value)}
        />
      </Togglable>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App
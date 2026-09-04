import About from '../components/About'
import Navbar from '../components/NavBar'

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <p>Welcome to our urban services company!</p>
            <div>
                <Navbar />
                <About />
            </div>
        </div>
    );
}

export default Home;
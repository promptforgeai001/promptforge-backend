import { Link } from "react-router-dom";


function Footer(){

return(

<footer className="bg-black border-t border-white/10 text-white mt-20">


<div className="max-w-7xl mx-auto px-10 py-16 grid md:grid-cols-4 gap-10">


{/* Brand */}

<div>

<h2 className="text-3xl font-bold text-blue-500">
PromptForge AI
</h2>

<p className="text-gray-400 mt-5">
AI Prompt Generator for creators and businesses.
</p>

</div>



{/* Company */}

<div>

<h3 className="font-bold text-xl mb-5">
Company
</h3>


<div className="flex flex-col gap-3 text-gray-400">


<Link
to="/"
className="hover:text-blue-500"
>
Home
</Link>


<Link
to="/contact"
className="hover:text-blue-500"
>
Contact
</Link>


</div>


</div>



{/* Product */}

<div>

<h3 className="font-bold text-xl mb-5">
Product
</h3>


<div className="flex flex-col gap-3 text-gray-400">


<Link
to="/library"
className="hover:text-blue-500"
>
Prompt Library
</Link>


<Link
to="/pricing"
className="hover:text-blue-500"
>
Pricing
</Link>


</div>


</div>



{/* Social */}

<div>

<h3 className="font-bold text-xl mb-5">
Resources
</h3>


<div className="flex flex-col gap-3 text-gray-400">


<Link
to="/library"
className="hover:text-blue-500"
>
Prompts
</Link>


<Link
to="/contact"
className="hover:text-blue-500"
>
Support
</Link>


</div>


</div>



</div>



<div className="border-t border-white/10 text-center py-5 text-gray-500">

© 2026 PromptForge AI. All rights reserved.

</div>


</footer>

)

}


export default Footer;
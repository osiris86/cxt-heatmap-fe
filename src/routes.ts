import Heatmap from './lib/Heatmap.svelte'
import Login from './lib/Login.svelte'

// Export the route definition object
export default {
  // Exact path
  '/': Heatmap,

  // Using named parameters, with last being optional
  '/login': Login,

  // Catch-all, must be last
  '*': Heatmap
}

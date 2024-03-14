<script lang="ts">
  import Heatmap from "./lib/Heatmap.svelte"
  let temps = [{
    place: "A1",
    temperature: 14,
    timestamp: new Date()
   }, {
    place: "A10",
    temperature: 24,
    timestamp: new Date()
   }, {
    place: "A20",
    temperature: 34,
    timestamp: new Date()
  }]

  setTimeout(() => {
    console.log('Updating positions')
    temps = [{
      place: "B1",
      temperature: 14,
      timestamp: new Date()
     }, {
      place: "B10",
      temperature: 24,
      timestamp: new Date()
     }, {
      place: "B20",
      temperature: 34,
      timestamp: new Date()
    }]
  }, 10000)
</script>
  

<main>
  <Heatmap temperatures={temps}/>
</main>

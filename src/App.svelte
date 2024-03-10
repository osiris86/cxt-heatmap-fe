<script lang="ts">
  import Heatmap from "./lib/Heatmap.svelte"
  const temps = [{
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
</script>
  

<main>
  <Heatmap temperatures={temps}/>
</main>

<script lang="ts">
  import { onMount } from 'svelte'
  import bestuhlungsplan from '../assets/bestuhlungsplan_cxt25.png';
  import { TemperatureMap } from './temperatureMap'
  import { saalplanMap } from './saalplanMap'

  export let temperatures: {
    place: string,
    temperature: number,
    timestamp: Date
  }[]

  const IMAGE_WIDTH = 1903
  const IMAGE_HEIGHT = 1124

  let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null;
  let w: number;
  let h: number;

  onMount(() => {
		context = canvas.getContext('2d')
    if (context) {
		  context.lineWidth = 3
    }
		
		handleSize()
	})

  const convertTemperatures = () => {
    return temperatures.map(({ place, temperature }) => {
      const seatLocation = saalplanMap[place as keyof typeof saalplanMap]
      return {
        x: seatLocation.x * w / IMAGE_WIDTH,
        y: seatLocation.y * h / IMAGE_HEIGHT,
        value: temperature
      }
    })
  }

  const draw = () => {
    if (!context) return;

    const temperaturePoints = convertTemperatures()

    const img = new Image()
    const temperatureMap = new TemperatureMap(context)
    img.onload = () => {
      temperatureMap.setPoints(temperaturePoints, w, h);
      temperatureMap.drawFull(false, () => {
        temperatureMap.drawPoints(async () => {
          const img2 = new Image();
          img2.onload = () => {
            if (!context) return;
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
            context.drawImage(img2, 0, 0, w, h);
          };
          img2.src = canvas.toDataURL();
        });
      });
    }
    img.src = bestuhlungsplan
  }

  const handleSize = () => {
		const { width } = canvas.getBoundingClientRect()
		w = width
		h = width / IMAGE_WIDTH * IMAGE_HEIGHT
    canvas.width = w
    canvas.height = h
    canvas.style.height = h + 'px'
    draw()
	}
</script>

<svelte:window on:resize={handleSize} />

<canvas on:resize={handleSize} bind:this={canvas} />


<style>
  canvas {
    width: 100%;
    background: white;
  }
</style>
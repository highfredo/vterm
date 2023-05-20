<template>
  <splitpanes :horizontal="direction === 'horizontal'">
    <pane :key="index" v-for="(p, index) in panels">
      <component
        v-if="p.component"
        :is="p.component"
        v-bind="p.props"
      />
      <spliteable-content
        v-else
        :path="path+'/'+index"
        :direction="p.direction"
        :panels="p.panels"
      />
    </pane>
  </splitpanes>
</template>

<script lang="ts" setup>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import SpliteableContent from './SpliteableContent.vue'
import { provide } from 'vue'

const props = withDefaults(defineProps<{
  path?: string;
  direction?: 'vertical' | 'horizontal',
  panels: { component: any, props: any }[]
}>(), {
  path: '/'
})

if(props.path === '/') {
  provide('split', {
    direction: props.direction,
    panels: props.panels,
  })
}

provide('split-key', props.path)

</script>

<style lang="scss">
.splitpanes__pane {
  box-shadow: 0 0 3px rgba(0, 0, 0, .2) inset;
  position: relative;
}

.splitpanes__splitter {
  background-color: rgb(229, 231, 235);
  background-repeat: no-repeat;
  background-position: 50% center;
}

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 10px;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 10px;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
}
</style>

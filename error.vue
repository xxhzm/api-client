<script setup>
const props = defineProps({
  error: Object
})

if (props.error.statusCode === 404) {
  clearError({ redirect: '/error/404' })
} else if (props.error.statusCode === 403) {
  clearError({ redirect: '/error/403' })
} else {
  clearError({ redirect: '/error/500' })
}
</script>
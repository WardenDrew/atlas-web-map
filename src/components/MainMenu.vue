<template>
  <q-drawer
    side="right"
    v-model="showMenu"
    bordered
    overlay
    :width="250"
    :breakpoint="500"
    :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    @before-hide="hideMenuTooltips()"
    behavior="desktop"
  >
    <div class="full-height column justify-between">
      <div class="col-grow">
        <q-scroll-area class="full-height">
          <q-list>
            <q-item
              v-for="n in 100"
              :key="n"
            >
              <q-item-section>MENU ITEM</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>
      <div>
        <q-list>
          <q-separator />
          <q-item
            v-if="authStore.state.signedIn"
            class="full-width"
          >
            <q-item-section v-if="authStore.state.signedIn">
              <div class="row justify-between no-wrap">
                <div class="overflow-hidden">
                  <div class="ellipsis text-weight-bold">{{ authStore.state.username }}</div>
                  <div class="ellipsis">{{ authStore.state.email }}</div>
                </div>
                <q-btn
                  flat
                  round
                  icon="mdi-logout"
                  @click="authStore.signOut()"
                >
                  <q-tooltip> Sign Out </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
          <q-item v-else>
            <div class="column full-width">
              <q-btn
                dense
                color="primary"
                rounded
                icon-right="mdi-account-plus"
                label="Sign Up"
                @click="authStore.signUp()"
              />
              <q-btn
                dense
                flat
                rounded
                label="Sign In"
                icon-right="mdi-login"
                @click="authStore.signIn()"
                class="q-mt-sm"
              />
            </div>
          </q-item>

          <q-separator />
          <div class="row justify-center">
            <q-btn
              flat
              size="sm"
              href="https://ironwatch.net"
              target="_blank"
              color="orange"
              class="full-width"
            >
              IronWatch LLC &copy; 2025
            </q-btn>
          </div>
        </q-list>
      </div>
    </div>

    <div
      class="absolute"
      style="top: 15px; left: -50px"
    >
      <q-btn
        round
        elevated
        color="blue-grey-7"
        icon="mdi-chevron-right"
        @click="showMenu = false"
      >
        <q-tooltip :ref="addMenuTooltipRef"> Close the Menu </q-tooltip>
      </q-btn>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { QTooltip, useQuasar } from 'quasar';
const $q = useQuasar();
const authStore = useAuthStore();

const showMenu = defineModel<boolean>({
  type: Boolean,
  required: true,
  default: false,
});

const menuTooltipRefs = ref(new Set<QTooltip>());

function addMenuTooltipRef(el: QTooltip | null) {
  if (el === null) return;
  menuTooltipRefs.value.add(el);
}

const hideMenuTooltips = () => {
  nextTick(() => {
    menuTooltipRefs.value.forEach((x) => x.hide());
  });
};
</script>

import vk
session = vk.Session()
api = vk.API(session)
api.users.get(user_ids=1)

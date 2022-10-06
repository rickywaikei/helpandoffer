# helpandoffer
# For 1st time setup
# run the following command in item2
cd ~	
nvm install 18.19.1	
mkdir -p ./helpandoffer	
cd ./helpandoffer	
nvm use 18.19.1	# make it run inside ./helpandoffer
# download all files/directories to ./helpandoffer (overwrite the original package.json file if any)
npm install	# install all dependencies specified in package.json file
npm run dev	# after running this, the app should be reached on http://localhost:5000
